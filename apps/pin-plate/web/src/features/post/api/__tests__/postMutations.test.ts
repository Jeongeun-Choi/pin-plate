import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPost } from '../createPost';
import { updatePost } from '../updatePost';

const mockFetch = vi.fn();

const postPayload = {
  content: '맛있어요',
  rating: 5,
  image_urls: [],
  image_keys: ['uploads/users/user-1/photo.webp'],
  place_name: '성수 카페',
  address: '서울 성동구',
  lat: 37.5,
  lng: 127,
  kakao_place_id: 'kakao-1',
  user_id: 'user-1',
  tags: [],
};

describe('post mutations', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates posts through the trusted posts API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }]),
    });

    await expect(createPost(postPayload)).resolves.toEqual([{ id: 1 }]);
    expect(mockFetch).toHaveBeenCalledWith('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload),
    });
  });

  it('updates posts through the trusted posts API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });

    await expect(updatePost({ id: 1, payload: postPayload })).resolves.toEqual({
      id: 1,
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, payload: postPayload }),
    });
  });
});
