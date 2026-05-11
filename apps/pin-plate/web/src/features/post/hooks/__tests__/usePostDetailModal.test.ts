import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostDetailModal } from '../usePostDetailModal';
import { Post } from '../../types/post';

const mockBack = vi.fn();
const mockDeletePost = vi.fn();
const mockConfirm = vi.fn();
const mockFetchNextPage = vi.fn();

function createPost(overrides?: Partial<Post>): Post {
  return {
    id: 1,
    content: '좋았어요',
    rating: 5,
    image_urls: [],
    place_name: '테스트 장소',
    address: '서울시 강남구',
    lat: 37.5,
    lng: 127,
    kakao_place_id: 'place-1',
    user_id: 'user-1',
    tags: [],
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

vi.mock('../usePost', () => ({
  usePost: () => ({
    data: createPost({
      id: 1,
      kakao_place_id: 'place-1',
      place_name: '테스트 장소',
    }),
  }),
}));

vi.mock('../usePosts', () => ({
  usePosts: () => ({
    data: [
      createPost({ id: 1, kakao_place_id: 'place-1' }),
      createPost({ id: 2, kakao_place_id: 'place-1' }),
      createPost({ id: 3, kakao_place_id: 'place-2' }),
    ],
  }),
}));

vi.mock('../usePostsByPlace', () => ({
  usePostsByPlace: () => ({
    data: {
      pages: [
        [
          createPost({ id: 1, kakao_place_id: 'place-1' }),
          createPost({ id: 2, kakao_place_id: 'place-1' }),
        ],
      ],
    },
    fetchNextPage: mockFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

vi.mock('../useDeletePost', () => ({
  useDeletePost: () => ({
    mutate: mockDeletePost,
  }),
}));

describe('usePostDetailModal', () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockDeletePost.mockReset();
    mockConfirm.mockReset();
    mockFetchNextPage.mockReset();
    vi.stubGlobal('confirm', mockConfirm);
  });

  it('장소 이름, 방문 횟수, 방문 기록 목록을 반환한다', () => {
    const { result } = renderHook(() => usePostDetailModal('1'));

    expect(result.current.placeName).toBe('테스트 장소');
    expect(result.current.visitCount).toBe(2);
    expect(result.current.allReviews.map((review) => review.id)).toEqual([
      1, 2,
    ]);
  });

  it('편집 상태를 전환한다', () => {
    const { result } = renderHook(() => usePostDetailModal('1'));

    act(() => {
      result.current.startEdit(2);
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.editingPost?.id).toBe(2);

    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editingPost).toBeNull();
  });

  it('현재 상세 기준 게시글을 삭제하면 삭제 성공 후 뒤로 이동한다', () => {
    mockConfirm.mockReturnValue(true);
    mockDeletePost.mockImplementation((_postId, options) => {
      options.onSuccess();
    });

    const { result } = renderHook(() => usePostDetailModal('1'));

    act(() => {
      result.current.deleteReview(1);
    });

    expect(mockDeletePost).toHaveBeenCalledWith(1, expect.any(Object));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
