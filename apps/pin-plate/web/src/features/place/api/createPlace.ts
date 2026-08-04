import type { CreatePlacePayload, Place } from '../types/place';

export const createPlace = async (
  userId: string,
  payload: CreatePlacePayload,
): Promise<Place> => {
  const response = await fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('place_create_failed');

  return (await response.json()) as Place;
};
