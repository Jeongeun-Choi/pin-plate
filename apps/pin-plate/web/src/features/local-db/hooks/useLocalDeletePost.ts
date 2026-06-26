import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localPostRepository } from '../repositories/localPostRepository';
import { localDbKeys } from '../localDbKeys';

export const useLocalDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => localPostRepository.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localDbKeys.all });
    },
  });
};
