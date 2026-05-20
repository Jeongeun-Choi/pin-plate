import { Input, Textarea } from '@pin-plate/ui';
import * as s from './ShareMapDialog.css';

interface Props {
  description: string;
  title: string;
  onDescriptionChange: (nextDescription: string) => void;
  onTitleChange: (nextTitle: string) => void;
}

export const ShareMapFormFields = ({
  description,
  title,
  onDescriptionChange,
  onTitleChange,
}: Props) => (
  <>
    <div className={s.fieldGroup}>
      <label className={s.label} htmlFor="share-map-title">
        공유 지도 제목
      </label>
      <Input
        id="share-map-title"
        value={title}
        maxLength={80}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="예: 성수 맛집 지도"
      />
    </div>

    <div className={s.fieldGroup}>
      <label className={s.label} htmlFor="share-map-description">
        설명
      </label>
      <Textarea
        id="share-map-description"
        value={description}
        maxLength={180}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="어떤 지도인지 짧게 적어 주세요."
      />
    </div>
  </>
);
