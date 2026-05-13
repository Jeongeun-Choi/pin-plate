import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Map } from '../Map';
import { saveGuestPosts } from '@/features/guest/storage/guestPostStorage';
import type { GuestPost } from '@/features/guest/types/guestPost';

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

vi.mock('../CustomMarker', () => ({
  default: () => <div data-testid="custom-marker" />,
}));

const renderMap = () => render(<Map />, { wrapper: JotaiProvider });

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

describe('Map', () => {
  let getCurrentPosition: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    window.nativeLocation = undefined;
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

  it('renders a marker for a guest post stored in localStorage', async () => {
    saveGuestPosts([createGuestPost('first')]);
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

  it('navigates to the guest post detail route when clicking a guest post marker', async () => {
    saveGuestPosts([createGuestPost('first')]);
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
