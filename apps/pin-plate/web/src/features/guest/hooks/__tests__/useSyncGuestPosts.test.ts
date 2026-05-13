import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWrapper } from '@/test-utils';
import {
  useSyncGuestPosts,
  type SyncGuestPostsResult,
} from '../useSyncGuestPosts';
import * as guestPostStorage from '../../storage/guestPostStorage';
import type { GuestPost } from '../../types/guestPost';

const { mockGetPlaceByKakaoId, mockCreatePlace, mockCreatePost } = vi.hoisted(
  () => ({
    mockGetPlaceByKakaoId: vi.fn(),
    mockCreatePlace: vi.fn(),
    mockCreatePost: vi.fn(),
  }),
);

vi.mock('@/features/place/api/getPlaceByKakaoId', () => ({
  getPlaceByKakaoId: mockGetPlaceByKakaoId,
}));

vi.mock('@/features/place/api/createPlace', () => ({
  createPlace: mockCreatePlace,
}));

vi.mock('@/features/post/api/createPost', () => ({
  createPost: mockCreatePost,
}));

const createGuestPost = (id: string): GuestPost => ({
  id,
  created_at: '2026-05-13T00:00:00.000Z',
  place_name: `테스트 맛집 ${id}`,
  address: '서울시 강남구',
  lat: 37.5,
  lng: 127,
  kakao_place_id: `kakao-${id}`,
  content: '맛있어요',
  rating: 4,
  image_urls: [],
  tags: [],
});

describe('useSyncGuestPosts', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetPlaceByKakaoId.mockReset();
    mockCreatePlace.mockReset();
    mockCreatePost.mockReset();
  });

  it('성공한 게스트 글만 로컬 저장소에서 제거하고 실패한 글은 남긴다', async () => {
    const firstPost = createGuestPost('first');
    const secondPost = createGuestPost('second');

    guestPostStorage.saveGuestPosts([firstPost, secondPost]);
    mockGetPlaceByKakaoId.mockResolvedValue({ id: 'place-123' });
    mockCreatePost
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('sync failed'));

    const { result } = renderHook(() => useSyncGuestPosts(), {
      wrapper: createWrapper(),
    });

    let syncResult: SyncGuestPostsResult | undefined;
    await act(async () => {
      syncResult = await result.current.syncGuestPosts('user-123');
    });

    expect(syncResult).toEqual({ successCount: 1, failedCount: 1 });
    expect(guestPostStorage.loadGuestPosts()).toEqual([secondPost]);
    expect(mockCreatePlace).not.toHaveBeenCalled();
  });
});
