import type { PlaceStatus } from '@/features/place/types/place';

export type RawPost = {
  id: number;
  rating: number;
  image_urls: string[];
  created_at: string;
};

const PLACE_STATUSES = new Set<PlaceStatus>([
  'wish',
  'visited',
  'want_to_revisit',
  'recommend',
]);

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isPlaceStatus = (value: unknown): value is PlaceStatus =>
  typeof value === 'string' && PLACE_STATUSES.has(value as PlaceStatus);

export const withPlaceStats = (place: Record<string, unknown>) => {
  const posts = Array.isArray(place.posts) ? (place.posts as RawPost[]) : [];
  const visitCount = posts.length;
  const averageRating =
    visitCount > 0
      ? posts.reduce((sum, post) => sum + post.rating, 0) / visitCount
      : null;
  const lastPost = [...posts].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
  const firstImage =
    posts.flatMap((post) => post.image_urls ?? []).find(Boolean) ?? null;

  return {
    ...place,
    posts,
    visit_count: visitCount,
    avg_rating: averageRating,
    last_visited_at: lastPost?.created_at ?? null,
    first_image: firstImage,
  };
};
