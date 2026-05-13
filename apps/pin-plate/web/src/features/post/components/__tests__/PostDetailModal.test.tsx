import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import { PostDetailModal } from '../PostDetailModal';
import { saveGuestPosts } from '@/features/guest/storage/guestPostStorage';
import type { GuestPost } from '@/features/guest/types/guestPost';

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

describe('PostDetailModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guest post route id이면 localStorage의 게스트 글 상세를 보여준다', () => {
    const guestPost = createGuestPost('first');
    saveGuestPosts([guestPost]);

    render(<PostDetailModal id={guestPost.id} />, {
      wrapper: JotaiProvider,
    });

    expect(screen.getAllByText('테스트 맛집 first').length).toBeGreaterThan(0);
    expect(screen.getByText('맛있어요')).toBeInTheDocument();
    expect(screen.getByText('서울시 강남구')).toBeInTheDocument();
  });
});
