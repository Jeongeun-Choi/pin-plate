import { Button } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import { ShareMapFormFields } from './ShareMapFormFields';
import { ShareMapStepIndicator } from './ShareMapStepIndicator';
import * as s from './ShareMapDialog.css';

interface Props {
  description: string;
  title: string;
  onClose: () => void;
  onDescriptionChange: (nextDescription: string) => void;
  onNext: () => void;
  onTitleChange: (nextTitle: string) => void;
}

export const ShareMapComposeStep = ({
  description,
  title,
  onClose,
  onDescriptionChange,
  onNext,
  onTitleChange,
}: Props) => (
  <>
    <header className={s.header}>
      <div>
        <h2 id="share-map-dialog-title" className={s.heading}>
          맛집 지도 공유하기
        </h2>
        <p className={s.subheading}>공유할 지도 이름과 설명을 정해요.</p>
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
      <ShareMapStepIndicator currentStep="compose" />
      <ShareMapFormFields
        description={description}
        title={title}
        onDescriptionChange={onDescriptionChange}
        onTitleChange={onTitleChange}
      />
    </div>

    <footer className={s.footer}>
      <Button type="button" variant="outline" size="md" onClick={onClose}>
        닫기
      </Button>
      <Button type="button" variant="solid" size="md" onClick={onNext}>
        다음
      </Button>
    </footer>
  </>
);
