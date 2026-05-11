import { createClient } from '@/utils/supabase/client';
import type { PlaceWithStats } from '../types/place';
import type { Post } from '@/features/post/types/post';

export const getPlaceWithPosts = async (
  placeId: string,
): Promise<PlaceWithStats> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*, posts(*)')
    .eq('id', placeId)
    .single();

  if (error) throw error;

  const posts: Post[] = data.posts ?? [];
  const visit_count = posts.length;
  const avg_rating =
    visit_count > 0
      ? posts.reduce((sum, p) => sum + p.rating, 0) / visit_count
      : null;
  const lastPost = [...posts].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
  const first_image =
    posts.flatMap((p) => p.image_urls ?? []).find(Boolean) ?? null;

  return {
    ...data,
    posts,
    visit_count,
    avg_rating,
    last_visited_at: lastPost?.created_at ?? null,
    first_image,
  } as PlaceWithStats;
};
