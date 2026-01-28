import { Input } from '@pin-plate/ui';
import { useRef, useState } from 'react';
import { KakaoPlace, KakaoSearchResponse } from '../types/search';
import * as styles from './styles/LocationSearchModal.css';

interface LocationSearchModalProps {
  isOpen: boolean;

  onClose: () => void;

  currentLocation?: { lat: number; lng: number };

  onSelectPlace?: (place: KakaoPlace) => void;
}

const LocationSearchModal = ({
  isOpen,

  onClose,

  currentLocation,

  onSelectPlace,
}: LocationSearchModalProps) => {
  const locationRef = useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const location = locationRef.current?.value;

      if (location) {
        setIsLoading(true);

        try {
          let apiUrl = `/api/search?query=${location}`;

          // 현재 위치가 있으면 쿼리 파라미터에 추가 (카카오 API 기준: x=경도, y=위도)

          if (currentLocation) {
            apiUrl += `&x=${currentLocation.lng}&y=${currentLocation.lat}`;
          }

          const response = await fetch(apiUrl);

          const data: KakaoSearchResponse = await response.json();
          console.log('Search results:', data);
          setSearchResults(data.documents || []);
        } catch (error) {
          console.error('Search failed:', error);

          alert('검색 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-search-title"
      >
        <div className={styles.header}>
          <h2 id="location-search-title" className={styles.title}>
            장소 검색
          </h2>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <Input
          ref={locationRef}
          placeholder="장소를 입력하세요"
          onKeyDown={handleEnter}
        />

        <div className={styles.resultsContainer}>
          {isLoading ? (
            <p>검색 중...</p>
          ) : (
            <ul className={styles.resultsList}>
              {searchResults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.resultItem}
                    onClick={() => {
                      onSelectPlace?.(item);
                    }}
                  >
                    <div className={styles.resultItemTitle}>
                      {item.place_name}
                    </div>
                    <div className={styles.resultItemAddress}>
                      {item.road_address_name || item.address_name}
                    </div>
                    {item.category_group_name && (
                      <div className={styles.resultItemCategory}>
                        {item.category_group_name}
                      </div>
                    )}
                  </button>
                </li>
              ))}
              {!isLoading && searchResults.length === 0 && (
                <p className={styles.emptyState}>검색 결과가 없습니다.</p>
              )}
            </ul>
          )}
        </div>

        <button onClick={onClose} className={styles.bottomCloseButton}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default LocationSearchModal;
