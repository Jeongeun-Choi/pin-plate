import { useQuery } from '@tanstack/react-query';
import { KakaoPlace } from '@/features/post/types/search';

interface UseNearbyRestaurantsParams {
  lat: number;
  lng: number;
}

const fetchNearbyRestaurants = async ({
  lat,
  lng,
}: UseNearbyRestaurantsParams): Promise<KakaoPlace[]> => {
  const res = await fetch(`/api/search/nearby?x=${lng}&y=${lat}&radius=300`);

  if (!res.ok) throw new Error('Failed to fetch nearby restaurants');

  const data = await res.json();
  return data.documents ?? [];
};

export const useNearbyRestaurants = (
  coords: { lat: number; lng: number } | null,
) => {
  return useQuery({
    queryKey: ['nearbyRestaurants', coords?.lat, coords?.lng],
    queryFn: () => fetchNearbyRestaurants(coords!),
    enabled: !!coords,
  });
};
