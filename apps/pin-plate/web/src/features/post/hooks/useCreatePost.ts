import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postKeys } from '../postKeys';

import { createPost } from '../api/createPost';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // 게시글 목록 쿼리 무효화 (새 글이 보이도록)
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
