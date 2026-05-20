import { Button, Checkbox } from '@pin-plate/ui';
import { IcDismiss } from '@pin-plate/ui/icons';
import type { PlaceWithStats } from '@/features/place/types/place';
import * as s from './ShareMapDialog.css';

interface Props {
  candidatePlaces: PlaceWithStats[];
  selectedPlaceIdSet: Set<string>;
  selectedSnapshotPlaceCount: number;
  onClose: () => void;
  onPlaceToggle: (placeId: string) => void;
}

export const ShareMapPlacePicker = ({
  candidatePlaces,
  selectedPlaceIdSet,
  selectedSnapshotPlaceCount,
  onClose,
  onPlaceToggle,
}: Props) => (
  <>
    <header className={s.header}>
      <div>
        <h2 id="share-map-manual-picker-title" className={s.heading}>
          공유할 장소 선택
        </h2>
        <p className={s.subheading}>
          후보 장소를 확인하고 제외할 곳만 빼 주세요.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={s.closeButton}
        onClick={onClose}
        aria-label="선택 닫기"
      >
        <IcDismiss width={18} height={18} />
      </Button>
    </header>

    <div className={s.body}>
      <div className={s.manualPickerList}>
        {candidatePlaces.map((place) => (
          <div key={place.id} className={s.placePickerItem}>
            <Checkbox
              className={s.checkboxLabel}
              checked={selectedPlaceIdSet.has(place.id)}
              onChange={() => onPlaceToggle(place.id)}
              label={
                <span className={s.placeText}>
                  <span className={s.placeName}>{place.place_name}</span>
                  <span className={s.placeAddress}>{place.address}</span>
                </span>
              }
            />
          </div>
        ))}
      </div>
    </div>

    <footer className={s.footer}>
      <Button type="button" variant="outline" size="md" onClick={onClose}>
        취소
      </Button>
      <Button type="button" variant="solid" size="md" onClick={onClose}>
        {selectedSnapshotPlaceCount}개 선택 완료
      </Button>
    </footer>
  </>
);
