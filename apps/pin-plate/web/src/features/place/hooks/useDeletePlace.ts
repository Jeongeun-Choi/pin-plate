import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlace } from '../api/deletePlace';
import { placeKeys } from '../placeKeys';

export const useDeletePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => deletePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    },
  });
};
