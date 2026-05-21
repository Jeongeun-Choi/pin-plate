import { Button } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import type { ShareMapDialogState } from './useShareMapDialogState';
import { ShareMapCriteriaControls } from './ShareMapCriteriaControls';
import { ShareMapStepIndicator } from './ShareMapStepIndicator';
import * as s from './ShareMapDialog.css';

interface Props {
  canCreateShareMap: boolean;
  dialogState: ShareMapDialogState;
  isCreatingSharedMap: boolean;
  onBack: () => void;
  onClose: () => void;
  onCreateShareMap: () => void;
}

export const ShareMapSelectionStep = ({
  canCreateShareMap,
  dialogState,
  isCreatingSharedMap,
  onBack,
  onClose,
  onCreateShareMap,
}: Props) => {
  const {
    criteriaType,
    criteriaValue,
    emptySharePlacesMessage,
    errorMessage,
    handleCriteriaTypeChange,
    handleCriteriaValueChange,
    handlePlacePickerOpen,
    handleRegionPickerOpen,
    handleTagPickerOpen,
    hasHiddenRegionOptions,
    hasHiddenTagOptions,
    hasNoCandidatePlaces,
    hasNoShareablePlaces,
    isPlaceCountCapped,
    limitedPlaces,
    placePickerButtonLabel,
    previewRegionOptions,
    previewTagOptions,
    selectedSnapshotPlaceCount,
    selectionSummaryDescription,
    selectionSummaryTitle,
    shareableStatusOptions,
  } = dialogState;

  return (
    <>
      <header className={s.header}>
        <div>
          <h2 id="share-map-dialog-title" className={s.heading}>
            공유할 장소 지정하기
          </h2>
          <p className={s.subheading}>기준을 고르고 공유될 장소를 확인해요.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={s.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          <IcDismiss width={18} height={18} />
        </Button>
      </header>

      <div className={s.body}>
        <ShareMapStepIndicator currentStep="selection" />

        <ShareMapCriteriaControls
          criteriaType={criteriaType}
          criteriaValue={criteriaValue}
          hasHiddenRegionOptions={hasHiddenRegionOptions}
          hasHiddenTagOptions={hasHiddenTagOptions}
          hasNoCandidatePlaces={hasNoCandidatePlaces}
          placePickerButtonLabel={placePickerButtonLabel}
          previewRegionOptions={previewRegionOptions}
          previewTagOptions={previewTagOptions}
          selectionSummaryDescription={selectionSummaryDescription}
          selectionSummaryTitle={selectionSummaryTitle}
          shareableStatusOptions={shareableStatusOptions}
          onCriteriaTypeChange={handleCriteriaTypeChange}
          onCriteriaValueChange={handleCriteriaValueChange}
          onPlacePickerOpen={handlePlacePickerOpen}
          onRegionPickerOpen={handleRegionPickerOpen}
          onTagPickerOpen={handleTagPickerOpen}
        />

        <div>
          <p className={s.countText}>
            공유할 장소 {limitedPlaces.length}개
            {isPlaceCountCapped &&
              ` | 선택한 ${selectedSnapshotPlaceCount}개 중 100개까지 포함돼요.`}
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
      </div>

      <footer className={s.footer}>
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          이전
        </Button>
        <Button
          type="button"
          variant="solid"
          size="md"
          onClick={onCreateShareMap}
          disabled={!canCreateShareMap}
        >
          {isCreatingSharedMap ? '만드는 중...' : '공유 링크 만들기'}
        </Button>
      </footer>
    </>
  );
};
