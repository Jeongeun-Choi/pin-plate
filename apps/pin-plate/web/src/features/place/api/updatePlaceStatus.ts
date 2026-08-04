import type { Place, PlaceStatus } from '../types/place';

export const updatePlaceStatus = async (
  placeId: string,
  status: PlaceStatus,
): Promise<Place> => {
  const response = await fetch('/api/places', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId, status }),
  });

  if (!response.ok) throw new Error('place_update_failed');

  return (await response.json()) as Place;
};
