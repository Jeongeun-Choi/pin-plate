import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWrapper } from '@/test-utils';
import {
  useSyncGuestPosts,
  type SyncGuestPostsResult,
} from '../useSyncGuestPosts';
import type { LocalPost } from '@/features/local-db/types';

const {
  mockGetAll,
  mockDeletePost,
  mockBulkDelete,
  mockGetPlaceByKakaoId,
  mockCreatePlace,
  mockCreatePost,
} = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockDeletePost: vi.fn(),
  mockBulkDelete: vi.fn(),
  mockGetPlaceByKakaoId: vi.fn(),
  mockCreatePlace: vi.fn(),
  mockCreatePost: vi.fn(),
}));

vi.mock('@/features/local-db/repositories/localPostRepository', () => ({
  localPostRepository: {
    getAll: mockGetAll,
    deletePost: mockDeletePost,
  },
}));

vi.mock('@/features/local-db/repositories/localPlaceRepository', () => ({
  localPlaceRepository: {
    getByKakaoId: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/features/local-db/repositories/localImageRepository', () => ({
  localImageRepository: {
    bulkDelete: mockBulkDelete,
  },
}));

vi.mock('@/features/local-db/utils/uploadLocalImagesToS3', () => ({
  uploadLocalImagesToS3: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/features/place/api/getPlaceByKakaoId', () => ({
  getPlaceByKakaoId: mockGetPlaceByKakaoId,
}));

vi.mock('@/features/place/api/createPlace', () => ({
  createPlace: mockCreatePlace,
}));

vi.mock('@/features/post/api/createPost', () => ({
  createPost: mockCreatePost,
}));

const createLocalPost = (id: string, overrides?: Partial<LocalPost>): LocalPost => ({
  id,
  place_id: `place-${id}`,
  created_at: '2026-05-13T00:00:00.000Z',
  place_name: `테스트 맛집 ${id}`,
  address: '서울시 강남구',
  lat: 37.5,
  lng: 127,
  kakao_place_id: `kakao-${id}`,
  content: '맛있어요',
  rating: 4,
  image_ids: [],
  tags: [],
  ...overrides,
});

describe('useSyncGuestPosts', () => {
  beforeEach(() => {
    mockGetAll.mockReset();
    mockDeletePost.mockReset();
    mockBulkDelete.mockReset();
    mockGetPlaceByKakaoId.mockReset();
    mockCreatePlace.mockReset();
    mockCreatePost.mockReset();
  });

  it('성공한 게스트 글만 로컬 저장소에서 제거하고 실패한 글은 남긴다', async () => {
    const firstPost = createLocalPost('first', {
      legacy_image_urls: ['https://image.test/uploads/guests/guest-1/a.webp'],
      legacy_image_keys: ['uploads/guests/guest-1/a.webp'],
    });
    const secondPost = createLocalPost('second');

    mockGetAll.mockResolvedValue([firstPost, secondPost]);
    mockGetPlaceByKakaoId.mockResolvedValue({ id: 'place-123' });
    mockCreatePost
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('sync failed'));
    mockDeletePost.mockResolvedValue(undefined);
    mockBulkDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSyncGuestPosts(), {
      wrapper: createWrapper(),
    });

    let syncResult: SyncGuestPostsResult | undefined;
    await act(async () => {
      syncResult = await result.current.syncGuestPosts('user-123');
    });

    expect(syncResult).toEqual({ successCount: 1, failedCount: 1 });
    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        image_urls: ['https://image.test/uploads/guests/guest-1/a.webp'],
        image_keys: ['uploads/guests/guest-1/a.webp'],
      }),
    );
    expect(mockDeletePost).toHaveBeenCalledTimes(1);
    expect(mockDeletePost).toHaveBeenCalledWith('first');
    expect(mockCreatePlace).not.toHaveBeenCalled();
  });
});
