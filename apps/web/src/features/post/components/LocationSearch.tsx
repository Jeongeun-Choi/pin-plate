import { useRef, useState, KeyboardEvent } from 'react';
import { KakaoPlace, KakaoSearchResponse } from '../types/search';
import * as styles from './styles/LocationSearch.css';
import { IcSearch, IcMarker } from '@pin-plate/ui';

interface LocationSearchProps {
  currentLocation?: { lat: number; lng: number };
  onSelectPlace?: (place: KakaoPlace) => void;
}

const LocationSearch = ({
  currentLocation,
  onSelectPlace,
}: LocationSearchProps) => {
  const locationRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const location = locationRef.current?.value;
    if (!location) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      let apiUrl = `/api/search?query=${location}`;
      if (currentLocation) {
        apiUrl += `&x=${currentLocation.lng}&y=${currentLocation.lat}`;
      }
      console.log(apiUrl);
      const response = await fetch(apiUrl);
      const data: KakaoSearchResponse = await response.json();
      setSearchResults(data.documents || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            ref={locationRef}
            className={styles.searchInput}
            placeholder="장소를 입력하세요"
            onKeyDown={handleEnter}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className={styles.searchButton}
        >
          <IcSearch width={20} height={20} />
          검색
        </button>
      </div>

      {hasSearched && (
        <div className={styles.resultsContainer}>
          {isLoading ? (
            <p className={styles.emptyState}>검색 중...</p>
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
                    <div className={styles.iconWrapper}>
                      <IcMarker width={20} height={20} />
                    </div>
                    <div className={styles.textContent}>
                      <div className={styles.resultItemTitle}>
                        {item.place_name}
                      </div>
                      {item.category_group_name && (
                        <div className={styles.resultItemCategory}>
                          {item.category_group_name}
                        </div>
                      )}
                      <div className={styles.resultItemAddress}>
                        {item.road_address_name || item.address_name}
                      </div>
                      {item.phone && (
                        <div className={styles.resultItemPhone}>
                          📞 {item.phone}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
              {!isLoading && searchResults.length === 0 && (
                <p className={styles.emptyState}>검색 결과가 없습니다.</p>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
