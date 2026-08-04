export const deletePlace = async (placeId: string): Promise<void> => {
  const response = await fetch(
    `/api/places?id=${encodeURIComponent(placeId)}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) throw new Error('place_delete_failed');
};
