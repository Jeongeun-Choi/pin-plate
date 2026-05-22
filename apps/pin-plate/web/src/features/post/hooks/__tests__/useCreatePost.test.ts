import { renderHook, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from '@/test-utils';
import { placeKeys } from '@/features/place/placeKeys';
import { useCreatePost } from '../useCreatePost';
import { postKeys } from '../../postKeys';
import type { CreatePostPayload } from '../../types/post';

const { mockCreatePost } = vi.hoisted(() => ({
  mockCreatePost: vi.fn(),
}));

vi.mock('../../api/createPost', () => ({
  createPost: mockCreatePost,
}));

const createPostPayload = (): CreatePostPayload => ({
  place_id: 'place-1',
  content: '맛있어요',
  rating: 4,
  image_urls: [],
  image_keys: [],
  place_name: '검색한 맛집',
  address: '서울시 강남구',
  lat: 37.5,
  lng: 127,
  kakao_place_id: 'kakao-1',
  user_id: 'user-1',
  tags: [],
});

describe('useCreatePost', () => {
  beforeEach(() => {
    mockCreatePost.mockReset();
  });

  it('post 생성 성공 후 장소 목록 캐시를 갱신한다', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    mockCreatePost.mockResolvedValueOnce([{ id: 1 }]);

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(createPostPayload());
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: postKeys.lists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [...postKeys.all, 'by-place'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: placeKeys.all,
    });
  });
});
