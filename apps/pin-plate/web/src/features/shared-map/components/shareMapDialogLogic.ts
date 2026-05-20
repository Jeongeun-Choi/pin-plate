import { PLACE_STATUS_FILTER_LABEL } from '@/features/place/constants/status';
import { ALL_TAGS } from '@/features/post/constants/tags';
import type { PlaceWithStats, PlaceStatus } from '@/features/place/types/place';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import type {
  PlaceSelectionState,
  ShareableStatusOption,
  ShareableTagOption,
} from './shareMapDialogTypes';
import { doesPlaceMatchRegion } from './shareMapRegionLogic';

export const MAX_SELECTED_PLACES = 100;

const SHAREABLE_STATUSES: PlaceStatus[] = ['recommend', 'want_to_revisit'];

export const getShareableStatusOptions = (
  places: PlaceWithStats[],
): ShareableStatusOption[] =>
  SHAREABLE_STATUSES.map((status) => ({
    value: status,
    label: PLACE_STATUS_FILTER_LABEL[status],
    count: places.filter((place) => place.status === status).length,
  }));

export const CRITERIA_OPTIONS: {
  value: SharedMapCriteriaType;
  label: string;
}[] = [
  { value: 'status', label: '상태' },
  { value: 'tag', label: '태그' },
  { value: 'region', label: '지역' },
  { value: 'manual', label: '직접 선택' },
];

export const createCriteriaKey = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => `${criteriaType}:${criteriaValue}`;

export const createInitialPlaceSelectionState = (): PlaceSelectionState => ({
  criteriaKey: createCriteriaKey('status', 'recommend'),
  selectedPlaceIds: [],
  hasCustomSelection: false,
});

export const getInitialCriteriaValue = (
  criteriaType: SharedMapCriteriaType,
  shareableTagOptions: ShareableTagOption[] = [],
  shareableRegionOptions: { value: string }[] = [],
) => {
  if (criteriaType === 'status') {
    return 'recommend';
  }
  if (criteriaType === 'tag') {
    return shareableTagOptions[0]?.value ?? '';
  }
  if (criteriaType === 'region') {
    return shareableRegionOptions[0]?.value ?? '';
  }
  return '';
};

export const getCandidatePlaces = (
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
    return places.filter((place) =>
      doesPlaceMatchRegion(place, normalizedRegion),
    );
  }
  return places;
};

interface GetSelectedPlaceIdsParams {
  candidatePlaceIdSet: Set<string>;
  candidatePlaceIds: string[];
  criteriaKey: string;
  criteriaType: SharedMapCriteriaType;
  placeSelectionState: PlaceSelectionState;
}

export const getSelectedPlaceIds = ({
  candidatePlaceIdSet,
  candidatePlaceIds,
  criteriaKey,
  criteriaType,
  placeSelectionState,
}: GetSelectedPlaceIdsParams) => {
  if (
    placeSelectionState.criteriaKey !== criteriaKey ||
    !placeSelectionState.hasCustomSelection
  ) {
    if (criteriaType === 'manual') {
      return [];
    }

    return candidatePlaceIds.slice(0, MAX_SELECTED_PLACES);
  }

  return placeSelectionState.selectedPlaceIds.filter((placeId) =>
    candidatePlaceIdSet.has(placeId),
  );
};

export const getShareMapTitleSuggestion = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'region' && criteriaValue.trim()) {
    return `${criteriaValue.trim()} 맛집 지도`;
  }
  if (criteriaType === 'tag') {
    const selectedTag = ALL_TAGS.find((tag) => tag.id === criteriaValue);
    if (selectedTag) {
      return `${selectedTag.label} 장소 지도`;
    }

    return '공유 장소 지도';
  }
  if (criteriaType === 'manual') {
    return '직접 고른 맛집 지도';
  }
  return '추천 장소 지도';
};
