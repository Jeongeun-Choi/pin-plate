import { useSetAtom } from 'jotai';
import { searchPlacesAtom, selectedSearchPlaceAtom } from '../atoms';
import { mapStore } from '../store/MapStore';
import { searchPlaces as fetchSearchPlaces } from '../api/searchPlaces';

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

    try {
      const data = await fetchSearchPlaces(
        keyword,
        center ? { x: center.x, y: center.y } : undefined,
      );
      setSearchPlaces(data.documents || []);
    } catch {
      setSearchPlaces([]);
    }
  };

  const clearSearchPlaces = () => {
    setSearchPlaces([]);
    setSelectedSearchPlace(null);
  };

  return { searchPlaces, clearSearchPlaces };
};
