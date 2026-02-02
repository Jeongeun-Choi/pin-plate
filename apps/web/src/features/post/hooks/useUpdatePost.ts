import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost } from '../api/updatePost';
import { postKeys } from '../postKeys';

export const useUpdatePost = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      onSuccess?.();
    },
  });
};
