import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '../api/deletePost';
import { postKeys } from '../postKeys';

export const useDeletePost = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      onSuccess?.();
    },
  });
};
