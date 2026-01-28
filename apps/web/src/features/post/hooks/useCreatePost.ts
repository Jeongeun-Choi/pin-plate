import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { postKeys } from '../postKeys';
import { CreatePostPayload } from '../types/post';

const createPost = async (payload: CreatePostPayload) => {
  const supabase = createClient();
  const { data, error } = await supabase.from('posts').insert(payload).select();

  if (error) throw error;
  return data;
};

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
