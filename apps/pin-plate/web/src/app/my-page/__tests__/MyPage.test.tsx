import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuestPost } from '@/features/guest/types/guestPost';
import type { Post } from '@/features/post/types/post';
import MyPage from '../page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/features/my-page/hooks/useMyProfile', () => ({
  useMyProfile: vi.fn(),
}));

vi.mock('@/features/guest/hooks/useGuestPosts', () => ({
  useGuestPosts: vi.fn(),
}));

vi.mock('@/features/post/hooks/usePosts', () => ({
  usePosts: vi.fn(),
}));

const { useMyProfile } = await import('@/features/my-page/hooks/useMyProfile');
const { useGuestPosts } = await import('@/features/guest/hooks/useGuestPosts');
const { usePosts } = await import('@/features/post/hooks/usePosts');

const mockedUseMyProfile = vi.mocked(useMyProfile);
const mockedUseGuestPosts = vi.mocked(useGuestPosts);
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

const createLocalPost = (): GuestPost => ({
  id: 'local-post-id',
  created_at: '2026-05-13T00:00:00.000Z',
  place_name: '긴 이름의 맛집',
  address: '서울시 성동구',
  lat: 37.5446,
  lng: 127.0557,
  kakao_place_id: 'kakao-local-post-id',
  content: '좋았어요',
  rating: 4.5,
  image_urls: [],
  tags: [],
});

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

describe('MyPage signed-out preview', () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockedUseMyProfile.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useMyProfile>);
    mockedUseGuestPosts.mockReturnValue({
      guestPosts: [],
      guestPostCount: 0,
      addGuestPost: vi.fn(),
      updateGuestPost: vi.fn(),
      removeGuestPost: vi.fn(),
      clearGuestPosts: vi.fn(),
    } as ReturnType<typeof useGuestPosts>);
    mockedUsePosts.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof usePosts>);
  });

  it('shows the locked report preview copy to signed-out users', () => {
    renderMyPage();

    expect(
      screen.getByRole('heading', { name: '나의 맛집 기록' }),
    ).toBeInTheDocument();
    expect(screen.getByText('취향 리포트')).toBeInTheDocument();
    expect(
      screen.getByText('로그인하면 내 취향 차트가 열려요'),
    ).toBeInTheDocument();
    expect(screen.getByText('이번 주 자주 간 음식점')).toBeInTheDocument();
    expect(screen.getByText('월간 장소 분포')).toBeInTheDocument();
    expect(screen.getByText('자주 남긴 태그')).toBeInTheDocument();
    expect(screen.queryByText('로그인이 필요합니다')).not.toBeInTheDocument();
  });

  it('routes primary and secondary actions to auth pages', () => {
    renderMyPage();

    fireEvent.click(
      screen.getAllByRole('button', { name: '로그인하고 리포트 보기' })[0],
    );
    expect(pushMock).toHaveBeenCalledWith('/sign-in');

    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(pushMock).toHaveBeenCalledWith('/sign-up');
  });

  it('shows empty local records state when there are no saved records on this device', () => {
    renderMyPage();

    expect(
      screen.getByRole('heading', { name: '이 기기에 저장된 기록' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('아직 이 기기에 저장된 기록이 없어요.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '맛집 기록하러 가기' }));
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('shows local records and routes to existing post detail URLs', () => {
    mockedUseGuestPosts.mockReturnValue({
      guestPosts: [createLocalPost()],
      guestPostCount: 1,
      addGuestPost: vi.fn(),
      updateGuestPost: vi.fn(),
      removeGuestPost: vi.fn(),
      clearGuestPosts: vi.fn(),
    } as ReturnType<typeof useGuestPosts>);

    renderMyPage();

    expect(screen.getByText('1개')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /긴 이름의 맛집/ }));
    expect(pushMock).toHaveBeenCalledWith('/post/local-post-id');
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
