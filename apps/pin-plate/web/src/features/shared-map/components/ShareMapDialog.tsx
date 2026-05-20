'use client';

import { useRef } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import { ShareMapMainForm } from './ShareMapMainForm';
import { ShareMapPlacePicker } from './ShareMapPlacePicker';
import { ShareMapRegionPicker } from './ShareMapRegionPicker';
import { ShareMapTagPicker } from './ShareMapTagPicker';
import { useDialogFocusTrap } from './useDialogFocusTrap';
import { useShareMapDialogState } from './useShareMapDialogState';
import { useShareMapShareActions } from './useShareMapShareActions';
import * as s from './ShareMapDialog.css';

interface Props {
  isOpen: boolean;
  places: PlaceWithStats[];
  ownerId: string;
  onClose: () => void;
}

const getDialogTitleId = (
  isTagPickerOpen: boolean,
  isPlacePickerOpen: boolean,
  isRegionPickerOpen: boolean,
) => {
  if (isTagPickerOpen) {
    return 'share-map-tag-picker-title';
  }
  if (isPlacePickerOpen) {
    return 'share-map-manual-picker-title';
  }
  if (isRegionPickerOpen) {
    return 'share-map-region-picker-title';
  }
  return 'share-map-dialog-title';
};

export const ShareMapDialog = ({ isOpen, places, ownerId, onClose }: Props) => {
  const dialogRef = useRef<HTMLElement>(null);

  const dialogState = useShareMapDialogState({ places, onClose });
  const {
    canCreateShareMap,
    handleCreateShareMap,
    handleShareUrl,
    isCreatingSharedMap,
  } = useShareMapShareActions({ dialogState, ownerId });

  useDialogFocusTrap({
    isOpen,
    dialogRef,
    onClose: dialogState.handleDialogClose,
  });

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
        aria-labelledby={getDialogTitleId(
          dialogState.isTagPickerOpen,
          dialogState.isPlacePickerOpen,
          dialogState.isRegionPickerOpen,
        )}
        tabIndex={-1}
      >
        {dialogState.isTagPickerOpen && (
          <ShareMapTagPicker
            tagSearchQuery={dialogState.tagSearchQuery}
            selectedTagValue={dialogState.criteriaValue}
            shareableTagOptions={dialogState.shareableTagOptions}
            recommendedTagOptions={dialogState.recommendedTagOptions}
            searchedTagOptions={dialogState.searchedTagOptions}
            hasTagSearchQuery={dialogState.hasTagSearchQuery}
            onClose={dialogState.handleTagPickerClose}
            onTagSearchQueryChange={dialogState.handleTagSearchQueryChange}
            onTagSelect={dialogState.handleCriteriaValueChange}
          />
        )}
        {dialogState.isPlacePickerOpen && (
          <ShareMapPlacePicker
            candidatePlaces={dialogState.candidatePlaces}
            selectedPlaceIdSet={dialogState.selectedPlaceIdSet}
            selectedSnapshotPlaceCount={dialogState.selectedSnapshotPlaceCount}
            onClose={dialogState.handlePlacePickerClose}
            onPlaceToggle={dialogState.handlePlaceToggle}
          />
        )}
        {dialogState.isRegionPickerOpen && (
          <ShareMapRegionPicker
            regionSearchQuery={dialogState.regionSearchQuery}
            selectedRegionValue={dialogState.criteriaValue}
            recommendedRegionOptions={dialogState.recommendedRegionOptions}
            searchedRegionOptions={dialogState.searchedRegionOptions}
            shareableRegionOptions={dialogState.shareableRegionOptions}
            hasRegionSearchQuery={dialogState.hasRegionSearchQuery}
            onClose={dialogState.handleRegionPickerClose}
            onRegionSearchQueryChange={
              dialogState.handleRegionSearchQueryChange
            }
            onRegionSelect={dialogState.handleCriteriaValueChange}
          />
        )}
        {!(
          dialogState.isTagPickerOpen ||
          dialogState.isPlacePickerOpen ||
          dialogState.isRegionPickerOpen
        ) && (
          <ShareMapMainForm
            canCreateShareMap={canCreateShareMap}
            dialogState={dialogState}
            isCreatingSharedMap={isCreatingSharedMap}
            onClose={dialogState.handleDialogClose}
            onCreateShareMap={handleCreateShareMap}
            onShareUrl={handleShareUrl}
          />
        )}
      </section>
    </div>
  );
};
