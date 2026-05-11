import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlaceStatus } from '../api/updatePlaceStatus';
import { placeKeys } from '../placeKeys';
import type { PlaceStatus } from '../types/place';

export const useUpdatePlaceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      placeId,
      status,
    }: {
      placeId: string;
      status: PlaceStatus;
    }) => updatePlaceStatus(placeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    },
  });
};
