import { Post } from '../types/post';

export const getPosts = async (): Promise<Post[]> => {
  const response = await fetch('/api/posts', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) return [];
  if (!response.ok) throw new Error('posts_fetch_failed');

  return (await response.json()) as Post[];
};
