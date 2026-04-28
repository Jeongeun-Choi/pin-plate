import { createClient } from '@/utils/supabase/client';
import { Post } from '../types/post';

const PAGE_SIZE = 3;

export const getPostsByPlaceId = async (
  userId: string,
  kakaoPlaceId: string,
  offset: number,
): Promise<Post[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .eq('kakao_place_id', kakaoPlaceId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;
  return (data ?? []) as unknown as Post[];
};

export { PAGE_SIZE };
