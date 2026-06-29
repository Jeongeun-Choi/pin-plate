import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostDetailModal } from '../PostDetailModal';
import type { LocalPostWithUrls } from '@/features/local-db/types';
import { createTestQueryClient } from '@/test-utils';

const mockDeletePost = vi.fn();
const mockUpdatePost = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: mockBack,
  }),
}));

vi.mock('@/features/map/components/MapPreview', () => ({
  MapPreview: () => <div data-testid="map-preview" />,
}));

vi.mock('@/hooks/useCurrentLocation', () => ({
  useCurrentLocation: () => ({
    location: { lat: 37.5, lng: 127 },
    fetchLocation: vi.fn().mockResolvedValue({ lat: 37.5, lng: 127 }),
  }),
}));

vi.mock('@/features/local-db/hooks/useLocalPost', () => ({
  useLocalPost: vi.fn(),
}));

vi.mock('@/features/local-db/hooks/useLocalDeletePost', () => ({
  useLocalDeletePost: () => ({ mutateAsync: mockDeletePost }),
}));

vi.mock('@/features/local-db/hooks/useLocalUpdatePost', () => ({
  useLocalUpdatePost: () => ({ mutateAsync: mockUpdatePost }),
}));

const { useLocalPost } = await import('@/features/local-db/hooks/useLocalPost');
const mockedUseLocalPost = vi.mocked(useLocalPost);

const createLocalPostWithUrls = (id: string): LocalPostWithUrls => ({
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
  image_urls: [],
  tags: [],
});

const createPostDetailModalWrapper = () => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>{children}</JotaiProvider>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('PostDetailModal', () => {
  beforeEach(() => {
    mockDeletePost.mockReset();
    mockUpdatePost.mockReset();
    mockBack.mockReset();
    mockDeletePost.mockResolvedValue(undefined);
    mockUpdatePost.mockResolvedValue(undefined);
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.stubGlobal('alert', vi.fn());
  });

  it('guest post route id이면 IndexedDB의 게스트 글 상세를 보여준다', () => {
    const localPost = createLocalPostWithUrls('first');
    mockedUseLocalPost.mockReturnValue({
      data: localPost,
      isLoading: false,
    } as ReturnType<typeof useLocalPost>);

    render(<PostDetailModal id={localPost.id} />, {
      wrapper: createPostDetailModalWrapper(),
    });

    expect(screen.getAllByText('테스트 맛집 first').length).toBeGreaterThan(0);
    expect(screen.getByText('맛있어요')).toBeInTheDocument();
    expect(screen.getByText('서울시 강남구')).toBeInTheDocument();
  });

  it('guest post 상세에서도 수정하기와 삭제하기 메뉴를 보여준다', () => {
    const localPost = createLocalPostWithUrls('first');
    mockedUseLocalPost.mockReturnValue({
      data: localPost,
      isLoading: false,
    } as ReturnType<typeof useLocalPost>);

    render(<PostDetailModal id={localPost.id} />, {
      wrapper: createPostDetailModalWrapper(),
    });

    fireEvent.click(screen.getByText('⋮'));

    expect(screen.getByText('수정하기')).toBeInTheDocument();
    expect(screen.getByText('삭제하기')).toBeInTheDocument();
  });

  it('guest post 삭제하기를 누르면 deletePost가 호출된다', async () => {
    const localPost = createLocalPostWithUrls('first');
    mockedUseLocalPost.mockReturnValue({
      data: localPost,
      isLoading: false,
    } as ReturnType<typeof useLocalPost>);

    render(<PostDetailModal id={localPost.id} />, {
      wrapper: createPostDetailModalWrapper(),
    });

    fireEvent.click(screen.getByText('⋮'));
    fireEvent.click(screen.getByText('삭제하기'));

    expect(mockDeletePost).toHaveBeenCalledWith('first');
  });

  it('guest post 수정 화면은 로그인 수정 화면과 같은 편집 UI를 보여준다', () => {
    const localPost = createLocalPostWithUrls('first');
    mockedUseLocalPost.mockReturnValue({
      data: localPost,
      isLoading: false,
    } as ReturnType<typeof useLocalPost>);

    render(<PostDetailModal id={localPost.id} />, {
      wrapper: createPostDetailModalWrapper(),
    });

    fireEvent.click(screen.getByText('⋮'));
    fireEvent.click(screen.getByText('수정하기'));

    expect(screen.getByText('태그')).toBeInTheDocument();
    expect(screen.getByText('+ 태그 추가')).toBeInTheDocument();
    expect(screen.getByText('사진')).toBeInTheDocument();
  });

  it('guest post 수정 완료 시 updatePost가 수정된 내용으로 호출된다', async () => {
    const localPost = createLocalPostWithUrls('first');
    mockedUseLocalPost.mockReturnValue({
      data: localPost,
      isLoading: false,
    } as ReturnType<typeof useLocalPost>);

    render(<PostDetailModal id={localPost.id} />, {
      wrapper: createPostDetailModalWrapper(),
    });

    fireEvent.click(screen.getByText('⋮'));
    fireEvent.click(screen.getByText('수정하기'));
    fireEvent.change(screen.getByDisplayValue('맛있어요'), {
      target: { value: '수정한 내용' },
    });
    fireEvent.click(screen.getByText('완료'));

    expect(mockUpdatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'first',
        updates: expect.objectContaining({ content: '수정한 내용' }),
      }),
    );
  });
});
