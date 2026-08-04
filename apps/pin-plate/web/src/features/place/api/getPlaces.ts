import type { PlaceWithStats } from '../types/place';

export const getPlaces = async (): Promise<PlaceWithStats[]> => {
  const response = await fetch('/api/places', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) return [];
  if (!response.ok) throw new Error('places_fetch_failed');

  return (await response.json()) as PlaceWithStats[];
};
