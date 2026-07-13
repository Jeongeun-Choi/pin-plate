import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@/features/post/types/post';
import MyPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/features/my-page/hooks/useMyProfile', () => ({
  useMyProfile: vi.fn(),
}));

vi.mock('@/features/post/hooks/usePosts', () => ({
  usePosts: vi.fn(),
}));

const { useMyProfile } = await import('@/features/my-page/hooks/useMyProfile');
const { usePosts } = await import('@/features/post/hooks/usePosts');

const mockedUseMyProfile = vi.mocked(useMyProfile);
const mockedUsePosts = vi.mocked(usePosts);

const renderMyPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MyPage />
    </QueryClientProvider>,
  );
};

const createServerPost = (overrides: Partial<Post>): Post => ({
  id: 1,
  created_at: '2026-05-13T03:00:00.000Z',
  place_name: '성수 파스타',
  address: '서울시 성동구',
  lat: 37.5446,
  lng: 127.0557,
  kakao_place_id: 'kakao-server-post-id',
  content: '좋았어요',
  rating: 4.5,
  image_urls: [],
  tags: ['파스타'],
  user_id: 'user-id',
  ...overrides,
});

describe('MyPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00.000Z'));
    mockedUsePosts.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof usePosts>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a loading state while the profile has not resolved yet', () => {
    mockedUseMyProfile.mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof useMyProfile>);

    renderMyPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      '마이페이지를 불러오는 중이에요.',
    );
  });

  it('shows a loading state when there is no profile (unauthenticated)', () => {
    mockedUseMyProfile.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useMyProfile>);

    renderMyPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      '마이페이지를 불러오는 중이에요.',
    );
  });

  it('shows one report chart at a time to signed-in users', () => {
    mockedUseMyProfile.mockReturnValue({
      data: {
        id: 'user-id',
        nickname: '맛집러',
        name: null,
        image_url: null,
        email: 'user@example.com',
      },
      isLoading: false,
    } as ReturnType<typeof useMyProfile>);
    mockedUsePosts.mockReturnValue({
      data: [
        createServerPost({ id: 1, place_name: '성수 파스타' }),
        createServerPost({ id: 2, place_name: '성수 파스타' }),
        createServerPost({
          id: 3,
          place_name: '연남 델리',
          tags: ['델리'],
        }),
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof usePosts>);

    renderMyPage();

    expect(screen.getByText('취향 리포트')).toBeInTheDocument();
    expect(screen.getByText('이번 주 자주 간 음식점')).toBeInTheDocument();
    expect(screen.queryByText('이번 달 장소 분포')).not.toBeInTheDocument();
    expect(screen.queryByText('자주 남긴 태그')).not.toBeInTheDocument();
    expect(screen.getAllByText('성수 파스타')[0]).toBeInTheDocument();
    expect(screen.getByText('2회')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '월간' }));
    expect(screen.getByText('이번 달 자주 간 음식점')).toBeInTheDocument();
    expect(screen.getByText('연남 델리')).toBeInTheDocument();
    expect(screen.getByText('1회')).toBeInTheDocument();
    expect(
      screen.queryByText('이번 주 자주 간 음식점'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '장소' }));
    expect(screen.getByText('이번 달 장소 분포')).toBeInTheDocument();
    expect(
      screen.queryByText('이번 달 자주 간 음식점'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '주간' }));
    expect(screen.getByText('이번 주 장소 분포')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '태그' }));
    expect(screen.getByText('자주 남긴 태그')).toBeInTheDocument();
    expect(screen.getByText('파스타 · 2')).toBeInTheDocument();
    expect(
      screen.queryByText('로그인하면 내 취향 차트가 열려요'),
    ).not.toBeInTheDocument();
  });
});
