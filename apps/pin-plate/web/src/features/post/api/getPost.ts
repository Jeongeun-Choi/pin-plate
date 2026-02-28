import { createClient } from '@/utils/supabase/client';
import { Post } from '../types/post';

export const getPost = async (id: number): Promise<Post> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as Post;
};
