import { renderHook, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { placeKeys } from '@/features/place/placeKeys';
import { createTestQueryClient } from '@/test-utils';
import { postKeys } from '../../postKeys';
import { useDeletePost } from '../useDeletePost';

const { mockDeletePost } = vi.hoisted(() => ({
  mockDeletePost: vi.fn(),
}));

vi.mock('../../api/deletePost', () => ({
  deletePost: mockDeletePost,
}));

describe('useDeletePost', () => {
  beforeEach(() => {
    mockDeletePost.mockReset();
  });

  it('post 삭제 성공 후 게시글과 장소 목록 캐시를 갱신한다', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    mockDeletePost.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeletePost(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(1);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: postKeys.lists(),
    });
    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: postKeys.detail(1),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [...postKeys.all, 'by-place'],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: placeKeys.all,
    });
  });
});
