import { useState } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import { ShareMapCompleteStep } from './ShareMapCompleteStep';
import { ShareMapComposeStep } from './ShareMapComposeStep';
import { ShareMapPlacePicker } from './ShareMapPlacePicker';
import { ShareMapRegionPicker } from './ShareMapRegionPicker';
import { ShareMapSelectionStep } from './ShareMapSelectionStep';
import { ShareMapTagPicker } from './ShareMapTagPicker';
import { useShareMapDialogState } from './useShareMapDialogState';
import { useShareMapShareActions } from './useShareMapShareActions';

interface Props {
  places: PlaceWithStats[];
  ownerId: string;
  onClose: () => void;
}

type ShareMapWizardStep = 'compose' | 'selection' | 'complete';

const focusDialogCloseButton = () => {
  window.setTimeout(() => {
    document
      .querySelector<HTMLButtonElement>('button[aria-label="닫기"]')
      ?.focus();
  }, 0);
};

export const ShareMapWizard = ({ places, ownerId, onClose }: Props) => {
  const [currentStep, setCurrentStep] = useState<ShareMapWizardStep>('compose');

  const dialogState = useShareMapDialogState({ places, onClose });
  const {
    canCreateShareMap,
    handleCreateShareMap,
    handleShareUrl,
    isCreatingSharedMap,
  } = useShareMapShareActions({ dialogState, ownerId });

  const handleSelectionStepOpen = () => {
    setCurrentStep('selection');
    focusDialogCloseButton();
  };

  const handleComposeStepOpen = () => {
    setCurrentStep('compose');
    focusDialogCloseButton();
  };

  const handleCompleteStepBack = () => {
    setCurrentStep('selection');
    focusDialogCloseButton();
  };

  const handleCreateShareMapClick = async () => {
    const wasShareMapCreated = await handleCreateShareMap();

    if (wasShareMapCreated) {
      setCurrentStep('complete');
      focusDialogCloseButton();
    }
  };

  if (dialogState.isTagPickerOpen) {
    return (
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
    );
  }

  if (dialogState.isPlacePickerOpen) {
    return (
      <ShareMapPlacePicker
        candidatePlaces={dialogState.candidatePlaces}
        selectedPlaceIdSet={dialogState.selectedPlaceIdSet}
        selectedSnapshotPlaceCount={dialogState.selectedSnapshotPlaceCount}
        onClose={dialogState.handlePlacePickerClose}
        onPlaceToggle={dialogState.handlePlaceToggle}
      />
    );
  }

  if (dialogState.isRegionPickerOpen) {
    return (
      <ShareMapRegionPicker
        regionSearchQuery={dialogState.regionSearchQuery}
        selectedRegionValue={dialogState.criteriaValue}
        recommendedRegionOptions={dialogState.recommendedRegionOptions}
        searchedRegionOptions={dialogState.searchedRegionOptions}
        shareableRegionOptions={dialogState.shareableRegionOptions}
        hasRegionSearchQuery={dialogState.hasRegionSearchQuery}
        onClose={dialogState.handleRegionPickerClose}
        onRegionSearchQueryChange={dialogState.handleRegionSearchQueryChange}
        onRegionSelect={dialogState.handleCriteriaValueChange}
      />
    );
  }

  if (currentStep === 'complete') {
    return (
      <ShareMapCompleteStep
        dialogState={dialogState}
        onBack={handleCompleteStepBack}
        onClose={dialogState.handleDialogClose}
        onShareUrl={handleShareUrl}
      />
    );
  }

  if (currentStep === 'selection') {
    return (
      <ShareMapSelectionStep
        canCreateShareMap={canCreateShareMap}
        dialogState={dialogState}
        isCreatingSharedMap={isCreatingSharedMap}
        onBack={handleComposeStepOpen}
        onClose={dialogState.handleDialogClose}
        onCreateShareMap={handleCreateShareMapClick}
      />
    );
  }

  return (
    <ShareMapComposeStep
      description={dialogState.description}
      title={dialogState.title}
      onClose={dialogState.handleDialogClose}
      onDescriptionChange={dialogState.handleDescriptionChange}
      onNext={handleSelectionStepOpen}
      onTitleChange={dialogState.handleTitleChange}
    />
  );
};
