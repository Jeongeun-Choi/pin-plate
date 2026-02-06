import { createClient } from '@/utils/supabase/client';

export const deletePost = async (id: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) throw error;
};
