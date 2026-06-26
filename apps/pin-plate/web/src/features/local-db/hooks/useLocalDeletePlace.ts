import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localPlaceRepository } from '../repositories/localPlaceRepository';
import { localDbKeys } from '../localDbKeys';

export const useLocalDeletePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => localPlaceRepository.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localDbKeys.all });
    },
  });
};
