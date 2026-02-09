import { useState } from 'react';
import { KakaoPlace, KakaoSearchResponse } from '../types/search';

interface UseLocationSearchProps {
  currentLocation?: { lat: number; lng: number };
}

export const useLocationSearch = ({
  currentLocation,
}: UseLocationSearchProps) => {
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async (keyword: string) => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      let apiUrl = `/api/search?query=${keyword}`;
      if (currentLocation) {
        apiUrl += `&x=${currentLocation.lng}&y=${currentLocation.lat}`;
      }
      const response = await fetch(apiUrl);
      const data: KakaoSearchResponse = await response.json();
      setSearchResults(data.documents || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setIsLoading(false);
  };

  return {
    searchResults,
    isLoading,
    hasSearched,
    search,
    resetSearch,
  };
};
