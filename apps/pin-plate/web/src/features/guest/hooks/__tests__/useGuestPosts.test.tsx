import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { describe, expect, it, beforeEach } from 'vitest';
import { useGuestPosts } from '../useGuestPosts';
import * as guestPostStorage from '../../storage/guestPostStorage';
import type { GuestPost } from '../../types/guestPost';

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

const createWrapper = () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider>{children}</JotaiProvider>
  );

  return Wrapper;
};

describe('useGuestPosts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('localStorage에 저장된 게스트 글을 초기 상태로 읽는다', () => {
    const firstPost = createGuestPost('first');

    guestPostStorage.saveGuestPosts([firstPost]);

    const { result } = renderHook(() => useGuestPosts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.guestPosts).toEqual([firstPost]);
    expect(result.current.guestPostCount).toBe(1);
  });
});
