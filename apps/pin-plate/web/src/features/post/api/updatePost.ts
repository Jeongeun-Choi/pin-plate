import { CreatePostPayload, Post } from '../types/post';

export interface UpdatePostParams {
  id: number;
  payload: Partial<CreatePostPayload>;
}

export const updatePost = async ({
  id,
  payload,
}: UpdatePostParams): Promise<Post> => {
  const response = await fetch('/api/posts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, payload }),
  });

  if (!response.ok) {
    throw new Error('post_update_failed');
  }

  return response.json();
};
