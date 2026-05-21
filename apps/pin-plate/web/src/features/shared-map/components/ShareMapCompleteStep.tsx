import { Button } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import type { ShareMapDialogState } from './useShareMapDialogState';
import { ShareMapShareResult } from './ShareMapShareResult';
import { ShareMapStepIndicator } from './ShareMapStepIndicator';
import * as s from './ShareMapDialog.css';

interface Props {
  dialogState: ShareMapDialogState;
  onBack: () => void;
  onClose: () => void;
  onShareUrl: () => void;
}

export const ShareMapCompleteStep = ({
  dialogState,
  onBack,
  onClose,
  onShareUrl,
}: Props) => {
  const {
    description,
    errorMessage,
    limitedPlaces,
    shareFeedbackMessage,
    shareMapTitle,
    shareUrl,
  } = dialogState;

  return (
    <>
      <header className={s.header}>
        <div>
          <h2 id="share-map-dialog-title" className={s.heading}>
            공유 링크가 만들어졌어요
          </h2>
          <p className={s.subheading}>이제 링크를 복사하거나 바로 공유해요.</p>
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
        <ShareMapStepIndicator currentStep="complete" />

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
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          다시 수정
        </Button>
        <Button type="button" variant="solid" size="md" onClick={onShareUrl}>
          공유하기
        </Button>
        <Button type="button" variant="outline" size="md" onClick={onClose}>
          닫기
        </Button>
      </footer>
    </>
  );
};
