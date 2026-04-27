import { KakaoSearchResponse } from '@/features/post/types/search';

export const searchPlaces = async (
  keyword: string,
  center?: { x: number; y: number },
): Promise<KakaoSearchResponse> => {
  const params = new URLSearchParams({ query: keyword });
  if (center) {
    params.set('x', String(center.x));
    params.set('y', String(center.y));
  }

  const response = await fetch(`/api/search?${params.toString()}`);
  if (!response.ok) throw new Error('Place search failed');
  return response.json();
};
