import { useRef, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { KakaoPlace } from '../types/search';
import { useLocationSearch } from '../hooks/useLocationSearch';
import * as styles from './styles/MobileLocationSearch.css';
import { IcSearch, IcMarker, IcDismiss } from '@pin-plate/ui';

interface MobileLocationSearchProps {
  currentLocation?: { lat: number; lng: number };
  onSelectPlace?: (place: KakaoPlace) => void;
  onClose: () => void;
  isOpen: boolean;
}

const MobileLocationSearch = ({
  currentLocation,
  onSelectPlace,
  onClose,
  isOpen,
}: MobileLocationSearchProps) => {
  const { searchResults, isLoading, hasSearched, search } = useLocationSearch({
    currentLocation,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSearchClick = () => {
    if (inputRef.current) {
      search(inputRef.current.value);
    }
  };

  const handleEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // Render using Portal to ensure it overlays everything regardless of parent z-index
  return createPortal(
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" onClick={onClose} className={styles.closeButton}>
          <IcDismiss width={24} height={24} />
        </button>
        <div className={styles.title}>장소 검색</div>
        <div style={{ width: 24 }} />
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="장소명 또는 주소 입력"
            autoFocus
            onKeyDown={handleEnter}
          />
        </div>
        <button
          type="button"
          onClick={handleSearchClick}
          className={styles.searchButton}
        >
          <IcSearch width={20} height={20} />
          <span>검색</span>
        </button>
      </div>

      {!hasSearched && (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIcon}>
            <IcSearch width={32} height={32} />
          </div>
          <div className={styles.emptyStateTitle}>맛집을 검색해보세요</div>
          <div className={styles.emptyStateDesc}>
            장소명이나 주소를 입력해주세요
          </div>
        </div>
      )}

      {hasSearched && (
        <div className={styles.resultsContainer}>
          {isLoading ? (
            <p className={styles.loadingState}>검색 중...</p>
          ) : (
            <ul className={styles.resultsList}>
              {searchResults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.resultItem}
                    onClick={() => {
                      onSelectPlace?.(item);
                      onClose();
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
                <p className={styles.loadingState}>검색 결과가 없습니다.</p>
              )}
            </ul>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
};

export default MobileLocationSearch;
