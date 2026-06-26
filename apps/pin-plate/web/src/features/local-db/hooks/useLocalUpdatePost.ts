import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localPostRepository } from '../repositories/localPostRepository';
import { localDbKeys } from '../localDbKeys';
import type { UpdateLocalPostInput } from '../types';

export const useLocalUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateLocalPostInput;
    }) => localPostRepository.updatePost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localDbKeys.all });
    },
  });
};
