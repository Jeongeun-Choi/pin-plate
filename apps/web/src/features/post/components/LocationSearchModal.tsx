import { Input } from '@pin-plate/ui';
import { useRef, useState } from 'react';
import { KakaoPlace, KakaoSearchResponse } from '../types/search';

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',

          padding: '20px',

          borderRadius: '8px',

          width: '90%',

          maxWidth: '400px',

          maxHeight: '80vh',

          display: 'flex',

          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',

            justifyContent: 'space-between',

            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>장소 검색</h2>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <Input
          ref={locationRef}
          placeholder="장소를 입력하세요"
          onKeyDown={handleEnter}
        />

        <div style={{ marginTop: '20px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <p>검색 중...</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  style={{
                    padding: '12px 0',

                    borderBottom: '1px solid #eee',

                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    onSelectPlace?.(item);
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {item.place_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.road_address_name || item.address_name}
                  </div>
                  {item.category_group_name && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '2px',
                      }}
                    >
                      {item.category_group_name}
                    </div>
                  )}
                </li>
              ))}
              {!isLoading && searchResults.length === 0 && (
                <p
                  style={{
                    color: '#999',
                    textAlign: 'center',
                    marginTop: '20px',
                  }}
                >
                  검색 결과가 없습니다.
                </p>
              )}
            </ul>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            marginTop: '20px',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default LocationSearchModal;
