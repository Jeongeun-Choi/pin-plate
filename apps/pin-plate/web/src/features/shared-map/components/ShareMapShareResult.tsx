import { Button, Input } from '@pin-plate/ui';
import type { PlaceWithStats } from '@/features/place/types/place';
import * as s from './ShareMapDialog.css';

interface Props {
  description: string;
  limitedPlaces: PlaceWithStats[];
  shareMapTitle: string;
  shareUrl: string;
  onShareUrl: () => void;
}

export const ShareMapShareResult = ({
  description,
  limitedPlaces,
  shareMapTitle,
  shareUrl,
  onShareUrl,
}: Props) => (
  <div className={s.successArea}>
    <div className={s.previewCard}>
      <p className={s.previewEyebrow}>상대방에게 이렇게 보여요</p>
      <p className={s.previewTitle}>{shareMapTitle}</p>
      <p className={s.previewDescription}>
        {description.trim() || `${limitedPlaces.length}개의 장소를 공유해요.`}
      </p>
      <p className={s.previewMeta}>장소 {limitedPlaces.length}개</p>
      {limitedPlaces[0] && (
        <p className={s.previewMeta}>{limitedPlaces[0].place_name}</p>
      )}
    </div>
    <label className={s.label} htmlFor="share-map-url">
      공유 링크
    </label>
    <div className={s.shareUrlRow}>
      <Input
        id="share-map-url"
        className={s.shareUrlInput}
        value={shareUrl}
        readOnly
      />
      <Button type="button" variant="outline" size="md" onClick={onShareUrl}>
        링크 복사
      </Button>
    </div>
  </div>
);
