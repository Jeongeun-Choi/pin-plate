'use client';

import { KakaoPlace } from '../types/search';
import * as styles from './styles/SelectedPlace.css';
import { IcMarker } from '@pin-plate/ui';
import { MapPreview } from '@/features/map/components/MapPreview';

interface SelectedPlaceProps {
  place: KakaoPlace;
  onReset: () => void;
}

export const SelectedPlace = ({ place, onReset }: SelectedPlaceProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>선택된 장소</h3>
        <button type="button" onClick={onReset} className={styles.retestButton}>
          다시 검색
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.infoRow}>
          <div className={styles.iconWrapper}>
            <IcMarker width={20} height={20} color="#ffa07a" />
          </div>
          <div className={styles.textContent}>
            <div className={styles.placeName}>{place.place_name}</div>
            <div className={styles.address}>
              {place.road_address_name || place.address_name}
            </div>
          </div>
        </div>

        <div className={styles.mapContainer}>
          <MapPreview lat={parseFloat(place.y)} lng={parseFloat(place.x)} />
        </div>
      </div>
    </div>
  );
};

export default SelectedPlace;
