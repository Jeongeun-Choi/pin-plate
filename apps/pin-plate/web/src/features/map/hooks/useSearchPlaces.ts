import { useSetAtom } from 'jotai';
import { searchPlacesAtom, selectedSearchPlaceAtom } from '../atoms';
import { KakaoSearchResponse } from '@/features/post/types/search';

export const useSearchPlaces = () => {
  const setSearchPlaces = useSetAtom(searchPlacesAtom);
  const setSelectedSearchPlace = useSetAtom(selectedSearchPlaceAtom);

  const searchPlaces = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchPlaces([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(keyword)}`,
      );
      const data: KakaoSearchResponse = await response.json();
      setSearchPlaces(data.documents || []);
    } catch (error) {
      console.error('Place search failed:', error);
      setSearchPlaces([]);
    }
  };

  const clearSearchPlaces = () => {
    setSearchPlaces([]);
    setSelectedSearchPlace(null);
  };

  return { searchPlaces, clearSearchPlaces };
};
