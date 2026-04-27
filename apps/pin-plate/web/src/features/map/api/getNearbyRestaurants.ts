import { KakaoPlace } from '@/features/post/types/search';

export const getNearbyRestaurants = async (
  lat: number,
  lng: number,
): Promise<KakaoPlace[]> => {
  const res = await fetch(`/api/search/nearby?x=${lng}&y=${lat}&radius=300`);
  if (!res.ok) throw new Error('Failed to fetch nearby restaurants');
  const data = await res.json();
  return data.documents ?? [];
};
