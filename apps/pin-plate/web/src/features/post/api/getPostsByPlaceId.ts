import { Post } from '../types/post';

const PAGE_SIZE = 3;

export const getPostsByPlaceId = async (
  _userId: string,
  placeId: string,
  offset: number,
): Promise<Post[]> => {
  const searchParams = new URLSearchParams({
    kakaoPlaceId: placeId,
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`/api/posts?${searchParams.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) return [];
  if (!response.ok) throw new Error('posts_by_place_fetch_failed');

  return (await response.json()) as Post[];
};

export { PAGE_SIZE };
