import { Post } from '../types/post';

export const getPost = async (id: number): Promise<Post> => {
  const response = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error('post_fetch_failed');

  return (await response.json()) as Post;
};
