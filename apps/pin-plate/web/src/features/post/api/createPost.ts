import { CreatePostPayload } from '../types/post';

export const createPost = async (payload: CreatePostPayload) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('post_create_failed');
  }

  return response.json();
};
