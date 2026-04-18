import { useSetAtom } from 'jotai';
import { searchPlacesAtom, selectedSearchPlaceAtom } from '../atoms';
import { KakaoSearchResponse } from '@/features/post/types/search';
import { mapStore } from '../store/MapStore';

export const useSearchPlaces = () => {
  const setSearchPlaces = useSetAtom(searchPlacesAtom);
  const setSelectedSearchPlace = useSetAtom(selectedSearchPlaceAtom);

  const searchPlaces = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchPlaces([]);
      return;
    }

    const map = mapStore.getMap();
    const center = map?.getCenter();
    const params = new URLSearchParams({ query: keyword });
    if (center) {
      params.set('x', String(center.x));
      params.set('y', String(center.y));
    }

    try {
      const response = await fetch(`/api/search?${params.toString()}`);
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
