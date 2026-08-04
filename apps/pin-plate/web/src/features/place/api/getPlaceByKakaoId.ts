import type { Place } from '../types/place';

export const getPlaceByKakaoId = async (
  _userId: string,
  kakaoPlaceId: string,
): Promise<Place | null> => {
  const searchParams = new URLSearchParams({ kakaoPlaceId });
  const response = await fetch(`/api/places?${searchParams.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error('place_by_kakao_id_fetch_failed');

  return (await response.json()) as Place | null;
};
