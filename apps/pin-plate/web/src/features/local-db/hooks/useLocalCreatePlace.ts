import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localPlaceRepository } from '../repositories/localPlaceRepository';
import { localDbKeys } from '../localDbKeys';
import type { CreateLocalPlaceInput } from '../types';

export const useLocalCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLocalPlaceInput) =>
      localPlaceRepository.addPlace(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localDbKeys.all });
    },
  });
};
