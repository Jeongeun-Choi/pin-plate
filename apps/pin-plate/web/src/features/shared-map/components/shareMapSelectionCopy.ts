import { PLACE_STATUS_FILTER_LABEL } from '@/features/place/constants/status';
import type { PlaceStatus } from '@/features/place/types/place';
import { ALL_TAGS } from '@/features/post/constants/tags';
import type { SharedMapCriteriaType } from '../types/sharedMap';

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

const getSelectionEmptyMessage = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
  hasNoCandidatePlaces: boolean,
) => {
  if (hasNoCandidatePlaces) {
    return getEmptySharePlacesMessage(criteriaType, criteriaValue);
  }

  return '공유할 장소를 하나 이상 선택해 주세요.';
};

const getPlacePickerButtonLabel = (criteriaType: SharedMapCriteriaType) => {
  if (criteriaType === 'manual') {
    return '장소 선택하기';
  }

  return '장소 확인하기';
};

const getSelectionSummaryDescription = (
  criteriaType: SharedMapCriteriaType,
) => {
  if (criteriaType === 'manual') {
    return '공유할 장소를 직접 골라요.';
  }

  return '기준으로 찾은 후보를 확인하고 제외할 수 있어요.';
};

const getSelectionSummaryTitle = ({
  candidatePlaceCount,
  criteriaSummaryLabel,
  criteriaType,
  selectedSnapshotPlaceCount,
}: {
  candidatePlaceCount: number;
  criteriaSummaryLabel: string;
  criteriaType: SharedMapCriteriaType;
  selectedSnapshotPlaceCount: number;
}) => {
  if (criteriaType === 'manual') {
    return `직접 고른 장소 ${selectedSnapshotPlaceCount}개`;
  }

  return `${criteriaSummaryLabel} 장소 ${candidatePlaceCount}개 중 ${selectedSnapshotPlaceCount}개 선택`;
};

interface GetSelectionCopyParams {
  candidatePlaceCount: number;
  criteriaType: SharedMapCriteriaType;
  criteriaValue: string;
  previewTagOptionCount: number;
  selectedSnapshotPlaceCount: number;
  shareableTagOptionCount: number;
}

export const getSelectionCopy = ({
  candidatePlaceCount,
  criteriaType,
  criteriaValue,
  previewTagOptionCount,
  selectedSnapshotPlaceCount,
  shareableTagOptionCount,
}: GetSelectionCopyParams) => {
  const criteriaSummaryLabel = getCriteriaSummaryLabel(
    criteriaType,
    criteriaValue,
  );
  const hasNoCandidatePlaces = candidatePlaceCount === 0;

  return {
    emptySharePlacesMessage: getSelectionEmptyMessage(
      criteriaType,
      criteriaValue,
      hasNoCandidatePlaces,
    ),
    hasHiddenTagOptions: shareableTagOptionCount > previewTagOptionCount,
    hasNoCandidatePlaces,
    placePickerButtonLabel: getPlacePickerButtonLabel(criteriaType),
    selectionSummaryDescription: getSelectionSummaryDescription(criteriaType),
    selectionSummaryTitle: getSelectionSummaryTitle({
      candidatePlaceCount,
      criteriaSummaryLabel,
      criteriaType,
      selectedSnapshotPlaceCount,
    }),
  };
};
