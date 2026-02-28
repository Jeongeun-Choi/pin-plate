import { createClient } from '@/utils/supabase/client';
import { Post } from '../types/post';

export const getPosts = async (): Promise<Post[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from('posts').select('*');

  if (error) throw error;
  return data as unknown as Post[];
};
