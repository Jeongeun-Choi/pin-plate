import { createClient } from '@/utils/supabase/client';
import type { PlaceWithStats } from '../types/place';

type RawPost = {
  id: number;
  rating: number;
  image_urls: string[];
  created_at: string;
};

export const getPlaces = async (userId: string): Promise<PlaceWithStats[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*, posts(id, rating, image_urls, created_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((place) => {
    const posts: RawPost[] = place.posts ?? [];
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
      ...place,
      posts,
      visit_count,
      avg_rating,
      last_visited_at: lastPost?.created_at ?? null,
      first_image,
    } as PlaceWithStats;
  });
};
