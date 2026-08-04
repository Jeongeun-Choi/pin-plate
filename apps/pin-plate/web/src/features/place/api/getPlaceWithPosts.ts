import type { PlaceWithStats } from '../types/place';

export const getPlaceWithPosts = async (
  placeId: string,
): Promise<PlaceWithStats> => {
  const response = await fetch(
    `/api/places?id=${encodeURIComponent(placeId)}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) throw new Error('place_with_posts_fetch_failed');

  return (await response.json()) as PlaceWithStats;
};
