'use client';

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Checkbox, Dropdown, Input, Radio, Textarea } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import { PLACE_STATUS_FILTER_LABEL } from '@/features/place/constants/status';
import { ALL_TAGS, TAG_GROUPS } from '@/features/post/constants/tags';
import type { PlaceWithStats, PlaceStatus } from '@/features/place/types/place';
import type { TagGroup } from '@/features/post/constants/tags';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import { useCreateSharedMap } from '../hooks/useCreateSharedMap';
import * as s from './ShareMapDialog.css';

const MAX_SELECTED_PLACES = 100;
const TAG_CHIP_PREVIEW_LIMIT = 8;
const RECOMMENDED_TAG_LIMIT = 5;
const SHAREABLE_STATUSES: PlaceStatus[] = ['recommend', 'want_to_revisit'];
const SHAREABLE_STATUS_OPTIONS = SHAREABLE_STATUSES.map((status) => ({
  value: status,
  label: PLACE_STATUS_FILTER_LABEL[status],
}));
const FOCUSABLE_DIALOG_SELECTOR =
  'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])';

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

const isDisabledFocusableElement = (element: HTMLElement) =>
  element.hasAttribute('disabled') ||
  ('disabled' in element && Boolean(element.disabled));

const getFocusableDialogElements = (dialogElement: HTMLElement | null) => {
  const focusableElements = dialogElement?.querySelectorAll<HTMLElement>(
    FOCUSABLE_DIALOG_SELECTOR,
  );

  return Array.from(focusableElements ?? []).filter(
    (focusableElement) => !isDisabledFocusableElement(focusableElement),
  );
};

interface Props {
  isOpen: boolean;
  places: PlaceWithStats[];
  ownerId: string;
  onClose: () => void;
}

interface PlaceSelectionState {
  criteriaKey: string;
  selectedPlaceIds: string[];
  hasCustomSelection: boolean;
}

interface ShareableTagOption {
  value: string;
  label: string;
  group: TagGroup;
  count: number;
}

interface ShareableTagOptionWithOrder extends ShareableTagOption {
  order: number;
}

const getInitialCriteriaValue = (
  criteriaType: SharedMapCriteriaType,
  shareableTagOptions: ShareableTagOption[] = [],
) => {
  if (criteriaType === 'status') {
    return 'recommend';
  }
  if (criteriaType === 'tag') {
    return shareableTagOptions[0]?.value ?? '';
  }
  return '';
};

const getShareableTagOptions = (
  places: PlaceWithStats[],
): ShareableTagOption[] => {
  const tagCounts = new Map<string, number>();

  places.forEach((place) => {
    new Set(place.tags).forEach((tagId) => {
      tagCounts.set(tagId, (tagCounts.get(tagId) ?? 0) + 1);
    });
  });

  return ALL_TAGS.map<ShareableTagOptionWithOrder>((tag, order) => ({
    value: tag.id,
    label: tag.label,
    group: tag.group,
    count: tagCounts.get(tag.id) ?? 0,
    order,
  }))
    .filter((tagOption) => tagOption.count > 0)
    .sort(
      (firstTagOption, secondTagOption) =>
        secondTagOption.count - firstTagOption.count ||
        firstTagOption.order - secondTagOption.order,
    )
    .map((tagOption) => ({
      value: tagOption.value,
      label: tagOption.label,
      group: tagOption.group,
      count: tagOption.count,
    }));
};

const getPreviewTagOptions = (
  shareableTagOptions: ShareableTagOption[],
  selectedTagValue: string,
) => {
  const previewTagOptions = shareableTagOptions.slice(
    0,
    TAG_CHIP_PREVIEW_LIMIT,
  );
  const hasSelectedTagPreview = previewTagOptions.some(
    (tagOption) => tagOption.value === selectedTagValue,
  );

  if (hasSelectedTagPreview || !selectedTagValue) {
    return previewTagOptions;
  }

  const selectedTagOption = shareableTagOptions.find(
    (tagOption) => tagOption.value === selectedTagValue,
  );

  if (!selectedTagOption) {
    return previewTagOptions;
  }

  return [
    ...previewTagOptions.slice(0, TAG_CHIP_PREVIEW_LIMIT - 1),
    selectedTagOption,
  ];
};

const getTagChipClassName = (isSelectedTag: boolean) =>
  isSelectedTag ? `${s.tagChip} ${s.selectedTagChip}` : s.tagChip;

const getTagOptionRowClassName = (isSelectedTag: boolean) =>
  isSelectedTag
    ? `${s.tagOptionRow} ${s.selectedTagOptionRow}`
    : s.tagOptionRow;

const normalizeTagSearchQuery = (tagSearchQuery: string) =>
  tagSearchQuery.trim().toLowerCase();

const getTagSearchRank = (
  tagOption: ShareableTagOption,
  normalizedTagSearchQuery: string,
) => {
  const normalizedLabel = tagOption.label.toLowerCase();
  const normalizedValue = tagOption.value.toLowerCase();

  if (
    normalizedLabel === normalizedTagSearchQuery ||
    normalizedValue === normalizedTagSearchQuery
  ) {
    return 0;
  }
  if (
    normalizedLabel.startsWith(normalizedTagSearchQuery) ||
    normalizedValue.startsWith(normalizedTagSearchQuery)
  ) {
    return 1;
  }
  if (
    normalizedLabel.includes(normalizedTagSearchQuery) ||
    normalizedValue.includes(normalizedTagSearchQuery)
  ) {
    return 2;
  }
  return null;
};

const getSearchedTagOptions = (
  shareableTagOptions: ShareableTagOption[],
  tagSearchQuery: string,
) => {
  const normalizedTagSearchQuery = normalizeTagSearchQuery(tagSearchQuery);

  if (!normalizedTagSearchQuery) {
    return [];
  }

  return shareableTagOptions
    .map((tagOption, order) => ({
      tagOption,
      order,
      searchRank: getTagSearchRank(tagOption, normalizedTagSearchQuery),
    }))
    .filter((tagSearchResult) => tagSearchResult.searchRank !== null)
    .sort((firstResult, secondResult) => {
      if (firstResult.searchRank !== secondResult.searchRank) {
        return Number(firstResult.searchRank) - Number(secondResult.searchRank);
      }
      return (
        secondResult.tagOption.count - firstResult.tagOption.count ||
        firstResult.order - secondResult.order
      );
    })
    .map((tagSearchResult) => tagSearchResult.tagOption);
};

const getCandidatePlaces = (
  places: PlaceWithStats[],
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'status') {
    return places.filter((place) => place.status === criteriaValue);
  }
  if (criteriaType === 'tag') {
    return places.filter((place) => place.tags.includes(criteriaValue));
  }
  if (criteriaType === 'region') {
    const normalizedRegion = criteriaValue.trim();
    if (!normalizedRegion) {
      return [];
    }
    return places.filter((place) => place.address.includes(normalizedRegion));
  }
  return places;
};

const createCriteriaKey = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => `${criteriaType}:${criteriaValue}`;

const getShareMapTitleSuggestion = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'region' && criteriaValue.trim()) {
    return `${criteriaValue.trim()} 맛집 지도`;
  }
  if (criteriaType === 'tag') {
    const selectedTag = ALL_TAGS.find((tag) => tag.id === criteriaValue);
    return selectedTag ? `${selectedTag.label} 장소 지도` : '공유 장소 지도';
  }
  if (criteriaType === 'manual') {
    return '직접 고른 맛집 지도';
  }
  return '추천 장소 지도';
};

const getEmptySharePlacesMessage = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'region' && !criteriaValue.trim()) {
    return '지역명을 입력하면 주소에 포함된 장소를 찾아요.';
  }
  if (criteriaType === 'region') {
    return '이 지역에 저장한 장소가 없어요. 다른 지역명이나 직접 선택을 써 보세요.';
  }
  if (criteriaType === 'tag' && !criteriaValue) {
    return '태그가 있는 장소가 없어요. 직접 선택을 써 보세요.';
  }
  if (criteriaType === 'tag') {
    return '이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.';
  }
  if (criteriaType === 'manual') {
    return '공유할 장소를 하나 이상 선택해 주세요.';
  }
  return '공유할 장소가 없어요. 다른 상태나 직접 선택을 써 보세요.';
};

const getCriteriaSummaryLabel = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'status') {
    return PLACE_STATUS_FILTER_LABEL[criteriaValue as PlaceStatus] ?? '상태';
  }
  if (criteriaType === 'tag') {
    const selectedTag = ALL_TAGS.find((tag) => tag.id === criteriaValue);
    return selectedTag?.label ?? '태그';
  }
  if (criteriaType === 'region') {
    return criteriaValue.trim() || '지역';
  }
  return '직접 고른';
};

export const ShareMapDialog = ({ isOpen, places, ownerId, onClose }: Props) => {
  const [criteriaType, setCriteriaType] =
    useState<SharedMapCriteriaType>('status');
  const [criteriaValue, setCriteriaValue] = useState('recommend');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placeSelectionState, setPlaceSelectionState] =
    useState<PlaceSelectionState>(() => ({
      criteriaKey: createCriteriaKey('status', 'recommend'),
      selectedPlaceIds: [],
      hasCustomSelection: false,
    }));
  const [isPlacePickerOpen, setIsPlacePickerOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shareFeedbackMessage, setShareFeedbackMessage] = useState('');

  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const { mutateAsync: createSharedMap, isPending: isCreatingSharedMap } =
    useCreateSharedMap();

  const shareableTagOptions = useMemo(
    () => getShareableTagOptions(places),
    [places],
  );

  const previewTagOptions = useMemo(
    () => getPreviewTagOptions(shareableTagOptions, criteriaValue),
    [criteriaValue, shareableTagOptions],
  );

  const recommendedTagOptions = useMemo(
    () => shareableTagOptions.slice(0, RECOMMENDED_TAG_LIMIT),
    [shareableTagOptions],
  );

  const searchedTagOptions = useMemo(
    () => getSearchedTagOptions(shareableTagOptions, tagSearchQuery),
    [shareableTagOptions, tagSearchQuery],
  );

  const candidatePlaces = useMemo(
    () => getCandidatePlaces(places, criteriaType, criteriaValue),
    [criteriaType, criteriaValue, places],
  );

  const candidatePlaceIds = useMemo(
    () => candidatePlaces.map((place) => place.id),
    [candidatePlaces],
  );

  const candidatePlaceIdSet = useMemo(
    () => new Set(candidatePlaceIds),
    [candidatePlaceIds],
  );

  const criteriaKey = createCriteriaKey(criteriaType, criteriaValue);
  const selectedPlaceIds = useMemo(() => {
    if (
      placeSelectionState.criteriaKey !== criteriaKey ||
      !placeSelectionState.hasCustomSelection
    ) {
      return criteriaType === 'manual'
        ? []
        : candidatePlaceIds.slice(0, MAX_SELECTED_PLACES);
    }

    return placeSelectionState.selectedPlaceIds.filter((placeId) =>
      candidatePlaceIdSet.has(placeId),
    );
  }, [
    candidatePlaceIdSet,
    candidatePlaceIds,
    criteriaKey,
    criteriaType,
    placeSelectionState,
  ]);

  const selectedPlaceIdSet = useMemo(
    () => new Set(selectedPlaceIds),
    [selectedPlaceIds],
  );

  const selectedSnapshotPlaces = useMemo(
    () => candidatePlaces.filter((place) => selectedPlaceIdSet.has(place.id)),
    [candidatePlaces, selectedPlaceIdSet],
  );

  const limitedPlaces = useMemo(
    () => selectedSnapshotPlaces.slice(0, MAX_SELECTED_PLACES),
    [selectedSnapshotPlaces],
  );
  const titleSuggestion = getShareMapTitleSuggestion(
    criteriaType,
    criteriaValue,
  );
  const criteriaSummaryLabel = getCriteriaSummaryLabel(
    criteriaType,
    criteriaValue,
  );
  const shareMapTitle = title.trim() || titleSuggestion;
  const candidatePlaceCount = candidatePlaces.length;
  const selectedSnapshotPlaceCount = selectedSnapshotPlaces.length;
  const hasNoShareablePlaces = limitedPlaces.length === 0;
  const hasNoCandidatePlaces = candidatePlaceCount === 0;
  const emptySharePlacesMessage = hasNoCandidatePlaces
    ? getEmptySharePlacesMessage(criteriaType, criteriaValue)
    : '공유할 장소를 하나 이상 선택해 주세요.';
  const isPlaceCountCapped =
    selectedSnapshotPlaceCount > MAX_SELECTED_PLACES ||
    candidatePlaceCount > MAX_SELECTED_PLACES;
  const canCreateShareMap = !hasNoShareablePlaces && !isCreatingSharedMap;
  const selectionSummaryTitle =
    criteriaType === 'manual'
      ? `직접 고른 장소 ${selectedSnapshotPlaceCount}개`
      : `${criteriaSummaryLabel} 장소 ${candidatePlaceCount}개 중 ${selectedSnapshotPlaceCount}개 선택`;
  const selectionSummaryDescription =
    criteriaType === 'manual'
      ? '공유할 장소를 직접 골라요.'
      : '기준으로 찾은 후보를 확인하고 제외할 수 있어요.';
  const placePickerButtonLabel =
    criteriaType === 'manual' ? '장소 선택하기' : '장소 확인하기';
  const hasHiddenTagOptions =
    shareableTagOptions.length > previewTagOptions.length;
  const hasTagSearchQuery = normalizeTagSearchQuery(tagSearchQuery).length > 0;

  const handleCriteriaTypeChange = useCallback(
    (nextCriteriaType: SharedMapCriteriaType) => {
      const nextCriteriaValue = getInitialCriteriaValue(
        nextCriteriaType,
        shareableTagOptions,
      );
      setCriteriaType(nextCriteriaType);
      setCriteriaValue(nextCriteriaValue);
      setPlaceSelectionState({
        criteriaKey: createCriteriaKey(nextCriteriaType, nextCriteriaValue),
        selectedPlaceIds: [],
        hasCustomSelection: false,
      });
      setIsPlacePickerOpen(false);
      setIsTagPickerOpen(false);
      setTagSearchQuery('');
      setShareUrl('');
      setErrorMessage('');
      setShareFeedbackMessage('');
    },
    [shareableTagOptions],
  );

  const handlePlaceToggle = useCallback(
    (placeId: string) => {
      const nextSelectedPlaceIds = selectedPlaceIds.includes(placeId)
        ? selectedPlaceIds.filter(
            (selectedPlaceId) => selectedPlaceId !== placeId,
          )
        : [...selectedPlaceIds, placeId];

      setPlaceSelectionState({
        criteriaKey,
        selectedPlaceIds: nextSelectedPlaceIds,
        hasCustomSelection: true,
      });
      setShareUrl('');
      setErrorMessage('');
      setShareFeedbackMessage('');
    },
    [criteriaKey, selectedPlaceIds],
  );

  const handlePlacePickerOpen = useCallback(() => {
    setIsTagPickerOpen(false);
    setIsPlacePickerOpen(true);
  }, []);

  const handlePlacePickerClose = useCallback(() => {
    setIsPlacePickerOpen(false);
  }, []);

  const handleCriteriaValueChange = useCallback(
    (nextCriteriaValue: string) => {
      setCriteriaValue(nextCriteriaValue);
      setPlaceSelectionState({
        criteriaKey: createCriteriaKey(criteriaType, nextCriteriaValue),
        selectedPlaceIds: [],
        hasCustomSelection: false,
      });
      setShareUrl('');
      setErrorMessage('');
      setShareFeedbackMessage('');
    },
    [criteriaType],
  );

  const handleTagPickerOpen = useCallback(() => {
    setIsPlacePickerOpen(false);
    setTagSearchQuery('');
    setIsTagPickerOpen(true);
  }, []);

  const handleTagPickerClose = useCallback(() => {
    setIsTagPickerOpen(false);
    setTagSearchQuery('');
  }, []);

  const handleTagSearchQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTagSearchQuery(event.target.value);
    },
    [],
  );

  const renderTagOptionRow = useCallback(
    (tagOption: ShareableTagOption) => {
      const isSelectedTag = criteriaValue === tagOption.value;

      return (
        <button
          key={tagOption.value}
          type="button"
          className={getTagOptionRowClassName(isSelectedTag)}
          aria-label={`${tagOption.label} ${tagOption.count}개`}
          aria-pressed={isSelectedTag}
          onClick={() => handleCriteriaValueChange(tagOption.value)}
        >
          <span className={s.tagOptionName}>{tagOption.label}</span>
          <span className={s.tagOptionMeta}>{tagOption.count}개</span>
          {isSelectedTag && (
            <span className={s.tagOptionSelectedText}>선택됨</span>
          )}
        </button>
      );
    },
    [criteriaValue, handleCriteriaValueChange],
  );

  const handleCreateShareMap = useCallback(async () => {
    if (limitedPlaces.length === 0) {
      setErrorMessage('공유할 장소가 없어요.');
      return;
    }

    try {
      setErrorMessage('');
      setShareFeedbackMessage('');
      const sharedMap = await createSharedMap({
        ownerId,
        payload: {
          title: shareMapTitle,
          description,
          criteriaType,
          criteriaValue,
          places: limitedPlaces,
        },
      });
      const nextShareUrl = `${window.location.origin}/share/${sharedMap.slug}`;
      setShareUrl(nextShareUrl);
    } catch {
      setShareFeedbackMessage('');
      setErrorMessage('공유 링크를 만들지 못했어요. 다시 시도해 주세요.');
    }
  }, [
    createSharedMap,
    criteriaType,
    criteriaValue,
    description,
    limitedPlaces,
    ownerId,
    shareMapTitle,
  ]);

  const handleShareUrl = useCallback(async () => {
    if (!shareUrl) {
      return;
    }

    try {
      setErrorMessage('');
      setShareFeedbackMessage('');
      if (navigator.share) {
        try {
          await navigator.share({
            title: title.trim() || 'Pin-plate 공유 지도',
            text:
              description.trim() ||
              `${limitedPlaces.length}개의 장소를 공유해요.`,
            url: shareUrl,
          });
          setShareFeedbackMessage('공유 옵션을 열었어요.');
          return;
        } catch (shareError) {
          if (isAbortError(shareError)) {
            return;
          }
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedbackMessage('링크를 복사했어요.');
        return;
      }

      setShareFeedbackMessage('');
      setErrorMessage('복사에 실패했어요. 링크를 직접 복사해 주세요.');
    } catch {
      setShareFeedbackMessage('');
      setErrorMessage('복사에 실패했어요. 링크를 직접 복사해 주세요.');
    }
  }, [description, limitedPlaces.length, shareUrl, title]);

  const handleClose = useCallback(() => {
    setIsPlacePickerOpen(false);
    setIsTagPickerOpen(false);
    setTagSearchQuery('');
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusableElements = getFocusableDialogElements(dialogRef.current);
    focusableElements?.[0]?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusableElements = getFocusableDialogElements(
        dialogRef.current,
      );
      const firstFocusableElement = currentFocusableElements[0];
      const lastFocusableElement =
        currentFocusableElements[currentFocusableElements.length - 1];
      const currentFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (!firstFocusableElement || !lastFocusableElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && currentFocusedElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }

      if (!event.shiftKey && currentFocusedElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    window.addEventListener('keydown', handleDialogKeyDown);

    return () => {
      window.removeEventListener('keydown', handleDialogKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={s.overlay} role="presentation">
      <section
        ref={dialogRef}
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          isTagPickerOpen
            ? 'share-map-tag-picker-title'
            : isPlacePickerOpen
              ? 'share-map-manual-picker-title'
              : 'share-map-dialog-title'
        }
        tabIndex={-1}
      >
        {isTagPickerOpen ? (
          <>
            <header className={s.header}>
              <div>
                <h2 id="share-map-tag-picker-title" className={s.heading}>
                  공유할 태그 선택
                </h2>
                <p className={s.subheading}>
                  검색하거나 많이 쓰인 태그부터 고를 수 있어요.
                </p>
              </div>
              <button
                type="button"
                className={s.closeButton}
                onClick={handleTagPickerClose}
                aria-label="태그 선택 닫기"
              >
                <IcDismiss width={18} height={18} />
              </button>
            </header>

            <div className={s.body}>
              <div className={s.tagPickerSearch}>
                <label className={s.label} htmlFor="share-map-tag-search">
                  태그 검색
                </label>
                <Input
                  id="share-map-tag-search"
                  className={s.input}
                  type="search"
                  value={tagSearchQuery}
                  onChange={handleTagSearchQueryChange}
                  placeholder="예: 혼밥, 뷰좋은, 카페"
                />
              </div>

              {hasTagSearchQuery ? (
                <section className={s.tagGroup}>
                  <h3 className={s.tagGroupHeading}>검색 결과</h3>
                  {searchedTagOptions.length > 0 ? (
                    <div className={s.tagOptionList}>
                      {searchedTagOptions.map(renderTagOptionRow)}
                    </div>
                  ) : (
                    <p className={s.emptyTagText}>일치하는 태그가 없어요.</p>
                  )}
                </section>
              ) : (
                <div className={s.tagGroupList}>
                  {recommendedTagOptions.length > 0 && (
                    <section className={s.tagGroup}>
                      <h3 className={s.tagGroupHeading}>추천</h3>
                      <div className={s.tagOptionList}>
                        {recommendedTagOptions.map(renderTagOptionRow)}
                      </div>
                    </section>
                  )}

                  {(Object.keys(TAG_GROUPS) as TagGroup[]).map((tagGroup) => {
                    const tagOptionsInGroup = shareableTagOptions.filter(
                      (tagOption) => tagOption.group === tagGroup,
                    );

                    if (tagOptionsInGroup.length === 0) {
                      return null;
                    }

                    return (
                      <section key={tagGroup} className={s.tagGroup}>
                        <h3 className={s.tagGroupHeading}>
                          {TAG_GROUPS[tagGroup].label}
                        </h3>
                        <div className={s.tagOptionList}>
                          {tagOptionsInGroup.map(renderTagOptionRow)}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            <footer className={s.footer}>
              <button
                type="button"
                className={s.secondaryButton}
                onClick={handleTagPickerClose}
              >
                닫기
              </button>
              <button
                type="button"
                className={s.primaryButton}
                onClick={handleTagPickerClose}
              >
                선택 완료
              </button>
            </footer>
          </>
        ) : isPlacePickerOpen ? (
          <>
            <header className={s.header}>
              <div>
                <h2 id="share-map-manual-picker-title" className={s.heading}>
                  공유할 장소 선택
                </h2>
                <p className={s.subheading}>
                  후보 장소를 확인하고 제외할 곳만 빼 주세요.
                </p>
              </div>
              <button
                type="button"
                className={s.closeButton}
                onClick={handlePlacePickerClose}
                aria-label="선택 닫기"
              >
                <IcDismiss width={18} height={18} />
              </button>
            </header>

            <div className={s.body}>
              <div className={s.manualPickerList}>
                {candidatePlaces.map((place) => (
                  <div key={place.id} className={s.placePickerItem}>
                    <Checkbox
                      className={s.checkboxLabel}
                      checked={selectedPlaceIdSet.has(place.id)}
                      onChange={() => handlePlaceToggle(place.id)}
                      label={
                        <span className={s.placeText}>
                          <span className={s.placeName}>
                            {place.place_name}
                          </span>
                          <span className={s.placeAddress}>
                            {place.address}
                          </span>
                        </span>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              <button
                type="button"
                className={s.secondaryButton}
                onClick={handlePlacePickerClose}
              >
                취소
              </button>
              <button
                type="button"
                className={s.primaryButton}
                onClick={handlePlacePickerClose}
              >
                {selectedSnapshotPlaceCount}개 선택 완료
              </button>
            </footer>
          </>
        ) : (
          <>
            <header className={s.header}>
              <div>
                <h2 id="share-map-dialog-title" className={s.heading}>
                  맛집 지도 공유하기
                </h2>
                <p className={s.subheading}>
                  조건에 맞는 내 장소를 모아 공유 링크를 만들어요.
                </p>
              </div>
              <button
                type="button"
                className={s.closeButton}
                onClick={handleClose}
                aria-label="닫기"
              >
                <IcDismiss width={18} height={18} />
              </button>
            </header>

            <div className={s.body}>
              <div className={s.fieldGroup}>
                <label className={s.label} htmlFor="share-map-title">
                  공유 지도 제목
                </label>
                <Input
                  id="share-map-title"
                  className={s.input}
                  value={title}
                  maxLength={80}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setShareUrl('');
                    setShareFeedbackMessage('');
                  }}
                  placeholder={titleSuggestion}
                />
              </div>

              <div className={s.fieldGroup}>
                <label className={s.label} htmlFor="share-map-description">
                  설명
                </label>
                <Textarea
                  id="share-map-description"
                  className={s.textarea}
                  value={description}
                  maxLength={180}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setShareUrl('');
                    setShareFeedbackMessage('');
                  }}
                  placeholder="어떤 지도인지 짧게 적어 주세요."
                />
              </div>

              <fieldset className={s.criteriaFieldset}>
                <legend className={s.criteriaLegend}>공유 기준</legend>
                <div className={s.radioGrid}>
                  {[
                    ['status', '상태'],
                    ['tag', '태그'],
                    ['region', '지역'],
                    ['manual', '직접 선택'],
                  ].map(([value, label]) => (
                    <Radio
                      key={value}
                      className={s.radioLabel}
                      name="share-map-criteria"
                      checked={criteriaType === value}
                      onChange={() =>
                        handleCriteriaTypeChange(value as SharedMapCriteriaType)
                      }
                      label={label}
                    />
                  ))}
                </div>
              </fieldset>

              <div className={s.criteriaControls}>
                {criteriaType === 'status' && (
                  <div className={s.fieldGroup}>
                    <label className={s.label} htmlFor="share-map-status">
                      공유할 상태
                    </label>
                    <Dropdown
                      id="share-map-status"
                      value={criteriaValue}
                      options={SHAREABLE_STATUS_OPTIONS}
                      onChange={handleCriteriaValueChange}
                    />
                  </div>
                )}

                {criteriaType === 'tag' && (
                  <fieldset className={s.tagFieldset}>
                    <legend className={s.tagLegend}>공유할 태그</legend>
                    {previewTagOptions.length > 0 ? (
                      <div className={s.tagChipGrid}>
                        {previewTagOptions.map((tagOption) => {
                          const isSelectedTag =
                            criteriaValue === tagOption.value;

                          return (
                            <button
                              key={tagOption.value}
                              type="button"
                              className={getTagChipClassName(isSelectedTag)}
                              aria-label={`${tagOption.label} ${tagOption.count}개`}
                              aria-pressed={isSelectedTag}
                              onClick={() =>
                                handleCriteriaValueChange(tagOption.value)
                              }
                            >
                              <span>{tagOption.label}</span>
                              <span className={s.tagChipCount}>
                                {tagOption.count}개
                              </span>
                            </button>
                          );
                        })}
                        {hasHiddenTagOptions && (
                          <button
                            type="button"
                            className={s.secondaryButton}
                            onClick={handleTagPickerOpen}
                          >
                            태그 더 보기
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className={s.emptyTagText}>
                        태그가 있는 장소가 없어요.
                      </p>
                    )}
                  </fieldset>
                )}

                {criteriaType === 'region' && (
                  <div className={s.fieldGroup}>
                    <label className={s.label} htmlFor="share-map-region">
                      공유할 지역
                    </label>
                    <Input
                      id="share-map-region"
                      className={s.input}
                      value={criteriaValue}
                      maxLength={80}
                      onChange={(event) =>
                        handleCriteriaValueChange(event.target.value)
                      }
                      placeholder="예: 성수동, 마포구"
                    />
                  </div>
                )}

                <div className={s.selectionSummary}>
                  <div className={s.selectionSummaryText}>
                    <span className={s.selectionSummaryTitle}>
                      {selectionSummaryTitle}
                    </span>
                    <span className={s.selectionSummaryDescription}>
                      {selectionSummaryDescription}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={s.secondaryButton}
                    onClick={handlePlacePickerOpen}
                    disabled={hasNoCandidatePlaces}
                  >
                    {placePickerButtonLabel}
                  </button>
                </div>
              </div>

              <div>
                <p className={s.countText}>
                  공유할 장소 {limitedPlaces.length}개
                  {isPlaceCountCapped &&
                    ` · 선택한 ${selectedSnapshotPlaceCount}개 중 100개까지 포함돼요.`}
                </p>
                {hasNoShareablePlaces && (
                  <p className={s.emptyText}>{emptySharePlacesMessage}</p>
                )}
              </div>

              {errorMessage && (
                <p className={s.errorText} role="alert">
                  {errorMessage}
                </p>
              )}

              {shareFeedbackMessage && (
                <p className={s.feedbackText} role="status">
                  {shareFeedbackMessage}
                </p>
              )}

              {shareUrl && (
                <div className={s.successArea}>
                  <div className={s.previewCard}>
                    <p className={s.previewEyebrow}>상대방에게 이렇게 보여요</p>
                    <p className={s.previewTitle}>{shareMapTitle}</p>
                    <p className={s.previewDescription}>
                      {description.trim() ||
                        `${limitedPlaces.length}개의 장소를 공유해요.`}
                    </p>
                    <p className={s.previewMeta}>
                      장소 {limitedPlaces.length}개
                    </p>
                    {limitedPlaces[0] && (
                      <p className={s.previewMeta}>
                        {limitedPlaces[0].place_name}
                      </p>
                    )}
                  </div>
                  <label className={s.label} htmlFor="share-map-url">
                    공유 링크
                  </label>
                  <div className={s.shareUrlRow}>
                    <Input
                      id="share-map-url"
                      className={s.shareUrlInput}
                      value={shareUrl}
                      readOnly
                    />
                    <button
                      type="button"
                      className={s.secondaryButton}
                      onClick={handleShareUrl}
                    >
                      링크 복사
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className={s.footer}>
              <button
                type="button"
                className={s.secondaryButton}
                onClick={handleClose}
              >
                닫기
              </button>
              <button
                type="button"
                className={s.primaryButton}
                onClick={shareUrl ? handleShareUrl : handleCreateShareMap}
                disabled={shareUrl ? false : !canCreateShareMap}
              >
                {shareUrl
                  ? '공유하기'
                  : isCreatingSharedMap
                    ? '공유 링크 만드는 중'
                    : '공유 링크 만들기'}
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
};
