import { Button } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import type { ShareMapDialogState } from './useShareMapDialogState';
import { ShareMapCriteriaControls } from './ShareMapCriteriaControls';
import { ShareMapFormFields } from './ShareMapFormFields';
import { ShareMapShareResult } from './ShareMapShareResult';
import { getShareMapPrimaryAction } from './shareMapPrimaryAction';
import * as s from './ShareMapDialog.css';

interface Props {
  canCreateShareMap: boolean;
  dialogState: ShareMapDialogState;
  isCreatingSharedMap: boolean;
  onClose: () => void;
  onCreateShareMap: () => void;
  onShareUrl: () => void;
}

export const ShareMapMainForm = ({
  canCreateShareMap,
  dialogState,
  isCreatingSharedMap,
  onClose,
  onCreateShareMap,
  onShareUrl,
}: Props) => {
  const {
    criteriaType,
    criteriaValue,
    description,
    emptySharePlacesMessage,
    errorMessage,
    handleCriteriaTypeChange,
    handleCriteriaValueChange,
    handleDescriptionChange,
    handlePlacePickerOpen,
    handleTagPickerOpen,
    handleTitleChange,
    hasHiddenTagOptions,
    hasNoCandidatePlaces,
    hasNoShareablePlaces,
    isPlaceCountCapped,
    limitedPlaces,
    placePickerButtonLabel,
    previewTagOptions,
    selectedSnapshotPlaceCount,
    selectionSummaryDescription,
    selectionSummaryTitle,
    shareFeedbackMessage,
    shareMapTitle,
    shareUrl,
    title,
  } = dialogState;

  const primaryAction = getShareMapPrimaryAction({
    canCreateShareMap,
    isCreatingSharedMap,
    shareUrl,
    onCreateShareMap,
    onShareUrl,
  });

  return (
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
        <ShareMapFormFields
          description={description}
          title={title}
          onDescriptionChange={handleDescriptionChange}
          onTitleChange={handleTitleChange}
        />

        <ShareMapCriteriaControls
          criteriaType={criteriaType}
          criteriaValue={criteriaValue}
          hasHiddenTagOptions={hasHiddenTagOptions}
          hasNoCandidatePlaces={hasNoCandidatePlaces}
          placePickerButtonLabel={placePickerButtonLabel}
          previewTagOptions={previewTagOptions}
          selectionSummaryDescription={selectionSummaryDescription}
          selectionSummaryTitle={selectionSummaryTitle}
          onCriteriaTypeChange={handleCriteriaTypeChange}
          onCriteriaValueChange={handleCriteriaValueChange}
          onPlacePickerOpen={handlePlacePickerOpen}
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

        {shareFeedbackMessage && (
          <p className={s.feedbackText} role="status">
            {shareFeedbackMessage}
          </p>
        )}

        {shareUrl && (
          <ShareMapShareResult
            description={description}
            limitedPlaces={limitedPlaces}
            shareMapTitle={shareMapTitle}
            shareUrl={shareUrl}
            onShareUrl={onShareUrl}
          />
        )}
      </div>

      <footer className={s.footer}>
        <Button type="button" variant="outline" size="md" onClick={onClose}>
          닫기
        </Button>
        <Button
          type="button"
          variant="solid"
          size="md"
          onClick={primaryAction.onClick}
          disabled={primaryAction.isDisabled}
        >
          {primaryAction.label}
        </Button>
      </footer>
    </>
  );
};
