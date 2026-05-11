import { useSetAtom } from 'jotai';
import { useMap } from '@vis.gl/react-google-maps';
import { searchPlacesAtom, selectedSearchPlaceAtom } from '../atoms';
import { searchPlaces as fetchSearchPlaces } from '../api/searchPlaces';

export const useSearchPlaces = () => {
  const map = useMap();
  const setSearchPlaces = useSetAtom(searchPlacesAtom);
  const setSelectedSearchPlace = useSetAtom(selectedSearchPlaceAtom);

  const searchPlaces = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchPlaces([]);
      return;
    }

    const center = map?.getCenter();

    try {
      const data = await fetchSearchPlaces(
        keyword,
        center ? { x: center.lng(), y: center.lat() } : undefined,
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
