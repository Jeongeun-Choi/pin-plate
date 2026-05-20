import { useMemo, useState } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import type { SharedMapCriteriaType } from '../types/sharedMap';
import {
  createCriteriaKey,
  createInitialPlaceSelectionState,
  getCandidatePlaces,
  getInitialCriteriaValue,
  getSelectedPlaceIds,
  MAX_SELECTED_PLACES,
} from './shareMapDialogLogic';
import { getSelectionCopy } from './shareMapSelectionCopy';
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
  const [isPlacePickerOpen, setIsPlacePickerOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const tagSelection = useShareMapTagSelection({
    criteriaValue,
    places,
    tagSearchQuery,
  });

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

  const handlePlacePickerOpen = () => {
    setIsTagPickerOpen(false);
    setIsPlacePickerOpen(true);
  };

  const handlePlacePickerClose = () => {
    setIsPlacePickerOpen(false);
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

  const handleTagPickerOpen = () => {
    setIsPlacePickerOpen(false);
    setTagSearchQuery('');
    setIsTagPickerOpen(true);
  };

  const handleTagPickerClose = () => {
    setIsTagPickerOpen(false);
    setTagSearchQuery('');
  };

  const handleTagSearchQueryChange = (nextSearchQuery: string) => {
    setTagSearchQuery(nextSearchQuery);
  };

  const resetPickerState = () => {
    setIsPlacePickerOpen(false);
    setIsTagPickerOpen(false);
    setTagSearchQuery('');
  };

  return {
    candidatePlaces,
    criteriaType,
    criteriaValue,
    emptySharePlacesMessage,
    handleCriteriaTypeChange,
    handleCriteriaValueChange,
    handlePlacePickerClose,
    handlePlacePickerOpen,
    handlePlaceToggle,
    handleTagPickerClose,
    handleTagPickerOpen,
    handleTagSearchQueryChange,
    hasNoCandidatePlaces,
    hasNoShareablePlaces,
    isPlaceCountCapped,
    isPlacePickerOpen,
    isTagPickerOpen,
    limitedPlaces,
    placePickerButtonLabel,
    resetPickerState,
    selectedPlaceIdSet,
    selectedSnapshotPlaceCount,
    selectionSummaryDescription,
    selectionSummaryTitle,
    tagSearchQuery,
    ...tagSelection,
  };
};
