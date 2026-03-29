import { createClient } from '@/utils/supabase/client';
import { Post } from '../types/post';

export const getPosts = async (userId: string): Promise<Post[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as unknown as Post[];
};
