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

  it('기존 image_keys가 없는 게스트 글도 읽는다', () => {
    const legacyPost = createGuestPost('legacy');

    expect(guestPostStorage.parseGuestPosts([legacyPost])).toEqual([
      legacyPost,
    ]);
  });

  it('URL 형태의 image_keys가 들어간 게스트 글은 무시한다', () => {
    const unsafePost = {
      ...createGuestPost('unsafe'),
      image_keys: ['https://evil.test/photo.webp'],
    };

    expect(guestPostStorage.parseGuestPosts([unsafePost])).toEqual([]);
  });
});
