import { createClient } from '@/utils/supabase/client';
import { CreatePostPayload, Post } from '../types/post';

export interface UpdatePostParams {
  id: number;
  payload: Partial<CreatePostPayload>;
}

export const updatePost = async ({
  id,
  payload,
}: UpdatePostParams): Promise<Post> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Post;
};
