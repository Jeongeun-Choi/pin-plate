import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postKeys } from '../postKeys';

import { createPost } from '../api/createPost';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...postKeys.all, 'by-place'],
      });
    },
  });
};
