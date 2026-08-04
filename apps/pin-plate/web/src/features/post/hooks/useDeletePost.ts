import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '../api/deletePost';
import { postKeys } from '../postKeys';
import { placeKeys } from '@/features/place/placeKeys';

export const useDeletePost = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: [...postKeys.all, 'by-place'],
      });
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
      onSuccess?.();
    },
  });
};
