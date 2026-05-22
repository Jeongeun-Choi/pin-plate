import { useMemo, useState } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import {
  createCriteriaKey,
  createInitialPlaceSelectionState,
  getCandidatePlaces,
  getInitialCriteriaValue,
  getSelectedPlaceIds,
  getShareableStatusOptions,
  MAX_SELECTED_PLACES,
} from '../utils/shareMapDialogLogic';
import { getSelectionCopy } from '../utils/shareMapSelectionCopy';
import { useShareMapPickerState } from './useShareMapPickerState';
import { useShareMapRegionSelection } from './useShareMapRegionSelection';
import { useShareMapTagSelection } from './useShareMapTagSelection';

interface Props {
  places: PlaceWithStats[];
  onSelectionChange: () => void;
}

const toggleSelectedPlaceId = (selectedPlaceIds: string[], placeId: string) => {
  if (selectedPlaceIds.includes(placeId)) {
    return selectedPlaceIds.filter(
      (selectedPlaceId) => selectedPlaceId !== placeId,
    );
  }

  return [...selectedPlaceIds, placeId];
};

export const useShareMapSelection = ({ places, onSelectionChange }: Props) => {
  const [criteriaType, setCriteriaType] =
    useState<SharedMapCriteriaType>('status');
  const [criteriaValue, setCriteriaValue] = useState('recommend');
  const [placeSelectionState, setPlaceSelectionState] = useState(
    createInitialPlaceSelectionState,
  );

  const pickerState = useShareMapPickerState();
  const tagSelection = useShareMapTagSelection({
    criteriaValue,
    places,
    tagSearchQuery: pickerState.tagSearchQuery,
  });
  const regionSelection = useShareMapRegionSelection({
    criteriaValue,
    places,
    regionSearchQuery: pickerState.regionSearchQuery,
  });
  const shareableStatusOptions = useMemo(
    () => getShareableStatusOptions(places),
    [places],
  );

  const candidatePlaces = useMemo(
    () => getCandidatePlaces(places, criteriaType, criteriaValue),
    [criteriaType, criteriaValue, places],
  );

  const candidatePlaceIds = candidatePlaces.map((place) => place.id);
  const candidatePlaceIdSet = new Set(candidatePlaceIds);
  const criteriaKey = createCriteriaKey(criteriaType, criteriaValue);
  const selectedPlaceIds = getSelectedPlaceIds({
    candidatePlaceIdSet,
    candidatePlaceIds,
    criteriaKey,
    criteriaType,
    placeSelectionState,
  });
  const selectedPlaceIdSet = new Set(selectedPlaceIds);
  const selectedSnapshotPlaces = candidatePlaces.filter((place) =>
    selectedPlaceIdSet.has(place.id),
  );
  const limitedPlaces = selectedSnapshotPlaces.slice(0, MAX_SELECTED_PLACES);

  const candidatePlaceCount = candidatePlaces.length;
  const selectedSnapshotPlaceCount = selectedSnapshotPlaces.length;
  const hasNoShareablePlaces = limitedPlaces.length === 0;
  const isPlaceCountCapped =
    selectedSnapshotPlaceCount > MAX_SELECTED_PLACES ||
    candidatePlaceCount > MAX_SELECTED_PLACES;
  const {
    emptySharePlacesMessage,
    hasNoCandidatePlaces,
    placePickerButtonLabel,
    selectionSummaryDescription,
    selectionSummaryTitle,
  } = getSelectionCopy({
    candidatePlaceCount,
    criteriaType,
    criteriaValue,
    previewTagOptionCount: tagSelection.previewTagOptions.length,
    selectedSnapshotPlaceCount,
    shareableTagOptionCount: tagSelection.shareableTagOptions.length,
  });

  const handleCriteriaTypeChange = (
    nextCriteriaType: SharedMapCriteriaType,
  ) => {
    const nextCriteriaValue = getInitialCriteriaValue(
      nextCriteriaType,
      tagSelection.shareableTagOptions,
      regionSelection.shareableRegionOptions,
    );
    setCriteriaType(nextCriteriaType);
    setCriteriaValue(nextCriteriaValue);
    setPlaceSelectionState({
      criteriaKey: createCriteriaKey(nextCriteriaType, nextCriteriaValue),
      selectedPlaceIds: [],
      hasCustomSelection: false,
    });
    pickerState.resetPickerState();
    onSelectionChange();
  };

  const handlePlaceToggle = (placeId: string) => {
    const nextSelectedPlaceIds = toggleSelectedPlaceId(
      selectedPlaceIds,
      placeId,
    );

    setPlaceSelectionState({
      criteriaKey,
      selectedPlaceIds: nextSelectedPlaceIds,
      hasCustomSelection: true,
    });
    onSelectionChange();
  };

  const handleCriteriaValueChange = (nextCriteriaValue: string) => {
    setCriteriaValue(nextCriteriaValue);
    setPlaceSelectionState({
      criteriaKey: createCriteriaKey(criteriaType, nextCriteriaValue),
      selectedPlaceIds: [],
      hasCustomSelection: false,
    });
    onSelectionChange();
  };

  return {
    candidatePlaces,
    criteriaType,
    criteriaValue,
    emptySharePlacesMessage,
    handleCriteriaTypeChange,
    handleCriteriaValueChange,
    handlePlaceToggle,
    hasNoCandidatePlaces,
    hasNoShareablePlaces,
    isPlaceCountCapped,
    limitedPlaces,
    placePickerButtonLabel,
    selectedPlaceIdSet,
    selectedSnapshotPlaceCount,
    selectionSummaryDescription,
    selectionSummaryTitle,
    shareableStatusOptions,
    ...pickerState,
    ...regionSelection,
    ...tagSelection,
  };
};
