import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlace } from '../api/createPlace';
import { placeKeys } from '../placeKeys';
import type { CreatePlacePayload } from '../types/place';

export const useCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: CreatePlacePayload;
    }) => createPlace(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    },
  });
};
