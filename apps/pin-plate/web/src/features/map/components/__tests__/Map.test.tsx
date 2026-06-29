import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Map } from '../Map';
import type { LocalPlaceWithStats } from '@/features/local-db/types';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('@vis.gl/react-google-maps', () => ({
  Map: ({
    children,
    defaultCenter,
  }: {
    children: React.ReactNode;
    defaultCenter: google.maps.LatLngLiteral;
  }) => (
    <div data-testid="google-map" data-center={JSON.stringify(defaultCenter)}>
      {children}
    </div>
  ),
  AdvancedMarker: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: (event: google.maps.MapMouseEvent) => void;
  }) => (
    <button
      type="button"
      data-testid="advanced-marker"
      onClick={() =>
        onClick?.({
          domEvent: new MouseEvent('click', { clientX: 10, clientY: 20 }),
        } as google.maps.MapMouseEvent)
      }
    >
      {children}
    </button>
  ),
  useMap: () => null,
}));

vi.mock('@/features/place/hooks/usePlaces', () => ({
  usePlaces: () => ({ data: [] }),
}));

const { mockUseLocalPlacesWithStats } = vi.hoisted(() => ({
  mockUseLocalPlacesWithStats: vi.fn(),
}));

vi.mock('@/features/local-db/hooks/useLocalPlacesWithStats', () => ({
  useLocalPlacesWithStats: mockUseLocalPlacesWithStats,
}));

vi.mock('../CustomMarker', () => ({
  default: () => <div data-testid="custom-marker" />,
}));

const createLocalPlace = (id: string): LocalPlaceWithStats => ({
  id,
  kakao_place_id: `kakao-${id}`,
  place_name: `테스트 맛집 ${id}`,
  address: '서울시 강남구',
  lat: 37.5,
  lng: 127,
  status: 'visited',
  tags: [],
  created_at: '2026-05-13T00:00:00.000Z',
  updated_at: '2026-05-13T00:00:00.000Z',
  posts: [{ id, rating: 4, image_urls: [], created_at: '2026-05-13T00:00:00.000Z' }],
  visit_count: 1,
  avg_rating: 4,
  last_visited_at: '2026-05-13T00:00:00.000Z',
  first_image: null,
});

const renderMap = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>{children}</JotaiProvider>
    </QueryClientProvider>
  );

  return render(<Map />, { wrapper: Wrapper });
};

describe('Map', () => {
  let getCurrentPosition: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseLocalPlacesWithStats.mockReturnValue({ data: [] });
    mockPush.mockReset();
    getCurrentPosition = vi.fn();

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition,
      },
    });
  });

  it('does not mount GoogleMap with the default center while current location is pending', () => {
    renderMap();

    expect(screen.queryByTestId('google-map')).not.toBeInTheDocument();
  });

  it('mounts GoogleMap with the current browser location when geolocation resolves', async () => {
    getCurrentPosition.mockImplementationOnce((onSuccess) => {
      onSuccess({
        coords: {
          latitude: 35.1796,
          longitude: 129.0756,
        },
      });
    });

    renderMap();

    await waitFor(() => {
      expect(screen.getByTestId('google-map')).toHaveAttribute(
        'data-center',
        JSON.stringify({ lat: 35.1796, lng: 129.0756 }),
      );
    });
  });

  it('renders a marker for a local place stored in IndexedDB', async () => {
    mockUseLocalPlacesWithStats.mockReturnValue({ data: [createLocalPlace('first')] });
    getCurrentPosition.mockImplementationOnce((onSuccess) => {
      onSuccess({
        coords: {
          latitude: 35.1796,
          longitude: 129.0756,
        },
      });
    });

    renderMap();

    await waitFor(() => {
      expect(screen.getByTestId('custom-marker')).toBeInTheDocument();
    });
  });

  it('navigates to the local post detail route when clicking a local place marker', async () => {
    mockUseLocalPlacesWithStats.mockReturnValue({ data: [createLocalPlace('first')] });
    getCurrentPosition.mockImplementationOnce((onSuccess) => {
      onSuccess({
        coords: {
          latitude: 35.1796,
          longitude: 129.0756,
        },
      });
    });

    renderMap();

    await waitFor(() => {
      expect(screen.getAllByTestId('advanced-marker').length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.click(screen.getAllByTestId('advanced-marker')[0]);

    expect(mockPush).toHaveBeenCalledWith('/post/first');
  });
});
