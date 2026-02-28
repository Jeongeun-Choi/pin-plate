import { createClient } from '@/utils/supabase/client';
import { CreatePostPayload } from '../types/post';

export const createPost = async (payload: CreatePostPayload) => {
  const supabase = createClient();
  const { data, error } = await supabase.from('posts').insert(payload).select();

  if (error) throw error;
  return data;
};
