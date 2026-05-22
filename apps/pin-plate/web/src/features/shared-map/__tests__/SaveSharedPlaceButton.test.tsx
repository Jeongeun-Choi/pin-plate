import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGuestPosts } from '@/features/guest/hooks/useGuestPosts';
import { getPlaceByKakaoId } from '@/features/place/api/getPlaceByKakaoId';
import { useCreatePlace } from '@/features/place/hooks/useCreatePlace';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import type { SharedMapPlace } from '../types/sharedMap';
import { SaveSharedPlaceButton } from '../components/SaveSharedPlaceButton';

vi.mock('@/utils/supabase/getCurrentUser', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/features/guest/hooks/useGuestPosts', () => ({
  useGuestPosts: vi.fn(),
}));

vi.mock('@/features/place/api/getPlaceByKakaoId', () => ({
  getPlaceByKakaoId: vi.fn(),
}));

vi.mock('@/features/place/hooks/useCreatePlace', () => ({
  useCreatePlace: vi.fn(),
}));

const sharedPlace: SharedMapPlace = {
  id: 'place-1',
  shared_map_id: 'map-1',
  source_place_id: 'source-1',
  kakao_place_id: 'kakao-1',
  place_name: '성수 카페',
  address: '서울 성동구',
  lat: 37.5,
  lng: 127.1,
  status: 'recommend',
  tags: ['work'],
  avg_rating: 4.5,
  first_image: null,
  visit_count: 2,
  sort_order: 0,
  created_at: '2026-05-13T00:00:00.000Z',
};

const renderButton = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SaveSharedPlaceButton sharedPlace={sharedPlace} />
    </QueryClientProvider>,
  );
};

const addGuestPost = vi.fn();
const createPlace = vi.fn();

describe('SaveSharedPlaceButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(getPlaceByKakaoId).mockResolvedValue(null);
    vi.mocked(useCreatePlace).mockReturnValue({
      mutateAsync: createPlace,
      isPending: false,
    } as unknown as ReturnType<typeof useCreatePlace>);
    vi.mocked(useGuestPosts).mockReturnValue({
      guestPosts: [],
      guestPostCount: 0,
      addGuestPost,
      removeGuestPost: vi.fn(),
      updateGuestPost: vi.fn(),
      clearGuestPosts: vi.fn(),
    });
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('guest-post-1');
  });

  it('saves through the guest post hook when the viewer is logged out', async () => {
    renderButton();

    const saveButton = await screen.findByRole('button', {
      name: '성수 카페 내 지도에 저장',
    });
    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '성수 카페 저장됐어요' }),
      ).toBeDisabled(),
    );
    expect(addGuestPost).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'guest-post-1',
        kakao_place_id: 'kakao-1',
        rating: 0,
        status: 'wish',
        has_visit_record: false,
      }),
    );
  });

  it('shows an already saved state on load for a logged-out duplicate shared place', async () => {
    vi.mocked(useGuestPosts).mockReturnValue({
      guestPosts: [
        {
          id: 'guest-post-1',
          created_at: '2026-05-13T00:00:00.000Z',
          place_name: '성수 카페',
          address: '서울 성동구',
          lat: 37.5,
          lng: 127.1,
          kakao_place_id: 'kakao-1',
          content: '기존 글',
          rating: 4,
          image_urls: [],
          tags: [],
        },
      ],
      guestPostCount: 1,
      addGuestPost,
      removeGuestPost: vi.fn(),
      updateGuestPost: vi.fn(),
      clearGuestPosts: vi.fn(),
    });

    renderButton();

    expect(
      await screen.findByRole('button', {
        name: '성수 카페 이미 저장됐어요',
      }),
    ).toBeDisabled();
    expect(addGuestPost).not.toHaveBeenCalled();
  });

  it('shows an already saved state on load for a logged-in duplicate shared place', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
    } as Awaited<ReturnType<typeof getCurrentUser>>);
    vi.mocked(getPlaceByKakaoId).mockResolvedValue({
      id: 'place-1',
      user_id: 'user-1',
      kakao_place_id: 'kakao-1',
      place_name: '성수 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127.1,
      status: 'recommend',
      tags: [],
      created_at: '2026-05-13T00:00:00.000Z',
      updated_at: '2026-05-13T00:00:00.000Z',
    });

    renderButton();

    expect(
      await screen.findByRole('button', {
        name: '성수 카페 이미 저장됐어요',
      }),
    ).toBeDisabled();
    expect(getPlaceByKakaoId).toHaveBeenCalledWith('user-1', 'kakao-1');
    expect(createPlace).not.toHaveBeenCalled();
  });

  it('saves a logged-in shared place as a wish place without copying the sharer status', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
    } as Awaited<ReturnType<typeof getCurrentUser>>);
    createPlace.mockResolvedValueOnce({
      id: 'place-1',
      user_id: 'user-1',
      kakao_place_id: 'kakao-1',
      place_name: '성수 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127.1,
      status: 'wish',
      tags: ['work'],
      created_at: '2026-05-13T00:00:00.000Z',
      updated_at: '2026-05-13T00:00:00.000Z',
    });

    renderButton();

    const saveButton = await screen.findByRole('button', {
      name: '성수 카페 내 지도에 저장',
    });
    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '성수 카페 저장됐어요' }),
      ).toBeDisabled(),
    );
    expect(createPlace).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: expect.objectContaining({
        kakao_place_id: 'kakao-1',
        status: 'wish',
      }),
    });
  });

  it('maps logged-in create failures to the failure state', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
    } as Awaited<ReturnType<typeof getCurrentUser>>);
    createPlace.mockRejectedValueOnce(new Error('create failed'));

    renderButton();

    const saveButton = await screen.findByRole('button', {
      name: '성수 카페 내 지도에 저장',
    });
    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.click(saveButton);

    expect(
      await screen.findByRole('button', {
        name: '성수 카페 저장하지 못했어요',
      }),
    ).toBeEnabled();
  });
});
