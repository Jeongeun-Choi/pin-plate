import { useQuery } from '@tanstack/react-query';
import { getNearbyRestaurants } from '../api/getNearbyRestaurants';
import { mapKeys } from '../mapKeys';

export const useNearbyRestaurants = (
  coords: { lat: number; lng: number } | null,
) => {
  return useQuery({
    queryKey: mapKeys.nearbyRestaurants(coords?.lat, coords?.lng),
    queryFn: () => getNearbyRestaurants(coords!.lat, coords!.lng),
    enabled: !!coords,
  });
};
