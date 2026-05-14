'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, Dropdown, Input, Radio, Textarea } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import { PLACE_STATUS_FILTER_LABEL } from '@/features/place/constants/status';
import { ALL_TAGS } from '@/features/post/constants/tags';
import type { PlaceWithStats, PlaceStatus } from '@/features/place/types/place';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import { useCreateSharedMap } from '../hooks/useCreateSharedMap';
import * as s from './ShareMapDialog.css';

const MAX_SELECTED_PLACES = 100;
const SHAREABLE_STATUSES: PlaceStatus[] = ['recommend', 'want_to_revisit'];
const SHAREABLE_STATUS_OPTIONS = SHAREABLE_STATUSES.map((status) => ({
  value: status,
  label: PLACE_STATUS_FILTER_LABEL[status],
}));
const TAG_OPTIONS = ALL_TAGS.map((tag) => ({
  value: tag.id,
  label: tag.label,
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

const getInitialCriteriaValue = (criteriaType: SharedMapCriteriaType) => {
  if (criteriaType === 'status') {
    return 'recommend';
  }
  if (criteriaType === 'tag') {
    return ALL_TAGS[0]?.id ?? '';
  }
  return '';
};

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
  if (criteriaType === 'tag') {
    return '이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.';
  }
  if (criteriaType === 'manual') {
    return '공유할 장소를 하나 이상 선택해 주세요.';
  }
  return '공유할 장소가 없어요. 다른 상태나 직접 선택을 써 보세요.';
};

export const ShareMapDialog = ({ isOpen, places, ownerId, onClose }: Props) => {
  const [criteriaType, setCriteriaType] =
    useState<SharedMapCriteriaType>('status');
  const [criteriaValue, setCriteriaValue] = useState('recommend');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shareFeedbackMessage, setShareFeedbackMessage] = useState('');

  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const { mutateAsync: createSharedMap, isPending: isCreatingSharedMap } =
    useCreateSharedMap();

  const filteredPlaces = useMemo(() => {
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
    return places.filter((place) => selectedPlaceIds.includes(place.id));
  }, [criteriaType, criteriaValue, places, selectedPlaceIds]);

  const limitedPlaces = useMemo(
    () => filteredPlaces.slice(0, MAX_SELECTED_PLACES),
    [filteredPlaces],
  );
  const titleSuggestion = getShareMapTitleSuggestion(
    criteriaType,
    criteriaValue,
  );
  const shareMapTitle = title.trim() || titleSuggestion;
  const hasNoShareablePlaces = limitedPlaces.length === 0;
  const emptySharePlacesMessage = getEmptySharePlacesMessage(
    criteriaType,
    criteriaValue,
  );
  const isPlaceCountCapped = filteredPlaces.length > MAX_SELECTED_PLACES;
  const canCreateShareMap = !hasNoShareablePlaces && !isCreatingSharedMap;
  const selectedManualPlaceCount = selectedPlaceIds.length;

  const handleCriteriaTypeChange = useCallback(
    (nextCriteriaType: SharedMapCriteriaType) => {
      setCriteriaType(nextCriteriaType);
      setCriteriaValue(getInitialCriteriaValue(nextCriteriaType));
      setIsManualPickerOpen(false);
      setShareUrl('');
      setErrorMessage('');
      setShareFeedbackMessage('');
    },
    [],
  );

  const handleManualPlaceToggle = useCallback((placeId: string) => {
    setSelectedPlaceIds((currentSelectedPlaceIds) => {
      if (currentSelectedPlaceIds.includes(placeId)) {
        return currentSelectedPlaceIds.filter(
          (selectedPlaceId) => selectedPlaceId !== placeId,
        );
      }
      return [...currentSelectedPlaceIds, placeId];
    });
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
  }, []);

  const handleManualPickerOpen = useCallback(() => {
    setIsManualPickerOpen(true);
  }, []);

  const handleManualPickerClose = useCallback(() => {
    setIsManualPickerOpen(false);
  }, []);

  const handleCriteriaValueChange = useCallback((nextCriteriaValue: string) => {
    setCriteriaValue(nextCriteriaValue);
    setShareUrl('');
    setErrorMessage('');
    setShareFeedbackMessage('');
  }, []);

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
    setIsManualPickerOpen(false);
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
          isManualPickerOpen
            ? 'share-map-manual-picker-title'
            : 'share-map-dialog-title'
        }
        tabIndex={-1}
      >
        {isManualPickerOpen ? (
          <>
            <header className={s.header}>
              <div>
                <h2 id="share-map-manual-picker-title" className={s.heading}>
                  공유할 장소 선택
                </h2>
                <p className={s.subheading}>
                  공유 지도에 담을 장소를 골라 주세요.
                </p>
              </div>
              <button
                type="button"
                className={s.closeButton}
                onClick={handleManualPickerClose}
                aria-label="선택 닫기"
              >
                <IcDismiss width={18} height={18} />
              </button>
            </header>

            <div className={s.body}>
              <div className={s.manualPickerList}>
                {places.map((place) => (
                  <Checkbox
                    key={place.id}
                    className={s.checkboxLabel}
                    checked={selectedPlaceIds.includes(place.id)}
                    onChange={() => handleManualPlaceToggle(place.id)}
                    label={
                      <span className={s.placeText}>
                        <span className={s.placeName}>{place.place_name}</span>
                        <span className={s.placeAddress}>{place.address}</span>
                      </span>
                    }
                  />
                ))}
              </div>
            </div>

            <footer className={s.footer}>
              <button
                type="button"
                className={s.secondaryButton}
                onClick={handleManualPickerClose}
              >
                취소
              </button>
              <button
                type="button"
                className={s.primaryButton}
                onClick={handleManualPickerClose}
              >
                {selectedManualPlaceCount}개 선택 완료
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
                  <div className={s.fieldGroup}>
                    <label className={s.label} htmlFor="share-map-tag">
                      공유할 태그
                    </label>
                    <Dropdown
                      id="share-map-tag"
                      value={criteriaValue}
                      options={TAG_OPTIONS}
                      onChange={handleCriteriaValueChange}
                    />
                  </div>
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

                {criteriaType === 'manual' && (
                  <div className={s.manualSummary}>
                    <div className={s.manualSummaryText}>
                      <span className={s.manualSummaryTitle}>
                        직접 고른 장소 {selectedManualPlaceCount}개
                      </span>
                      <span className={s.manualSummaryDescription}>
                        공유할 장소를 별도 sheet에서 선택해요.
                      </span>
                    </div>
                    <button
                      type="button"
                      className={s.secondaryButton}
                      onClick={handleManualPickerOpen}
                    >
                      장소 선택하기
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className={s.countText}>
                  공유할 장소 {limitedPlaces.length}개
                  {isPlaceCountCapped &&
                    ` · 전체 ${filteredPlaces.length}개 중 100개까지 포함돼요.`}
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
