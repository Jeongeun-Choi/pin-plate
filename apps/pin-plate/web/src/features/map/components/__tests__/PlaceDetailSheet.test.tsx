import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clickedMapInfoAtom, selectedSearchPlaceAtom } from '../../atoms';
import { PlaceDetailSheet } from '../PlaceDetailSheet';
import type { Place } from '@/features/post/types/search';

const mockUseNearbyRestaurants = vi.fn();
const mockUsePlaces = vi.fn();
const mockCreatePlace = vi.fn();
const mockRemovePlace = vi.fn();

vi.mock('../../hooks/useNearbyRestaurants', () => ({
  useNearbyRestaurants: (coords: { lat: number; lng: number } | null) =>
    mockUseNearbyRestaurants(coords),
}));

vi.mock('@/features/place/hooks/usePlaces', () => ({
  usePlaces: () => mockUsePlaces(),
}));

vi.mock('@/features/place/hooks/useCreatePlace', () => ({
  useCreatePlace: () => ({
    mutateAsync: mockCreatePlace,
    isPending: false,
  }),
}));

vi.mock('@/features/place/hooks/useDeletePlace', () => ({
  useDeletePlace: () => ({
    mutateAsync: mockRemovePlace,
    isPending: false,
  }),
}));

vi.mock('@/utils/supabase/getCurrentUser', () => ({
  getCurrentUser: vi.fn(),
}));

const createPlace = (overrides: Partial<Place>): Place => ({
  id: 'place-1',
  place_name: '첫 번째 식당',
  category_name: '음식점 > 한식',
  category_group_code: '',
  category_group_name: '',
  phone: '',
  address_name: '서울시 성동구',
  road_address_name: '서울시 성동구 연무장길 1',
  x: '127.05',
  y: '37.54',
  place_url: '',
  distance: '80',
  ...overrides,
});

interface RenderSheetOptions {
  clientX?: number;
  clientY?: number;
}

const renderSheet = ({
  clientX = 120,
  clientY = 240,
}: RenderSheetOptions = {}) => {
  const store = createStore();
  store.set(clickedMapInfoAtom, {
    lat: 37.54,
    lng: 127.05,
    clientX,
    clientY,
  });
  store.set(selectedSearchPlaceAtom, null);

  return render(
    <JotaiProvider store={store}>
      <PlaceDetailSheet />
    </JotaiProvider>,
  );
};

const appendSheetBoundary = (bottom: number) => {
  const boundary = document.createElement('div');
  boundary.setAttribute('data-place-detail-sheet-boundary', '');
  boundary.getBoundingClientRect = () =>
    ({
      bottom,
      height: bottom,
      left: 0,
      right: window.innerWidth,
      top: 0,
      width: window.innerWidth,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(boundary);
};

describe('PlaceDetailSheet', () => {
  beforeEach(() => {
    mockUseNearbyRestaurants.mockReset();
    mockUsePlaces.mockReset();
    mockCreatePlace.mockReset();
    mockRemovePlace.mockReset();
    mockUsePlaces.mockReturnValue({ data: [] });
  });

  it('지도 클릭 주변 검색 결과가 여러 개면 모든 음식점을 목록으로 보여준다', () => {
    mockUseNearbyRestaurants.mockReturnValue({
      data: [
        createPlace({ id: 'place-1', place_name: '첫 번째 식당' }),
        createPlace({ id: 'place-2', place_name: '두 번째 식당' }),
      ],
      isLoading: false,
    });

    renderSheet();

    expect(screen.getByText('주변 음식점 2곳')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 식당')).toBeInTheDocument();
    expect(screen.getByText('두 번째 식당')).toBeInTheDocument();
  });

  it('클릭 위치가 가장자리에 가까워도 데스크톱 시트를 화면 안쪽으로 배치한다', () => {
    mockUseNearbyRestaurants.mockReturnValue({
      data: [createPlace({ id: 'place-1', place_name: '첫 번째 식당' })],
      isLoading: false,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 768,
    });

    renderSheet({ clientX: 8, clientY: 80 });

    const sheet = screen.getByRole('button', { name: '닫기' }).parentElement;

    expect(sheet).toHaveAttribute('data-placement', 'below');
    expect(sheet).toHaveStyle({ '--sheet-left': '176px' });
    expect(sheet).toHaveStyle({ '--sheet-top': '96px' });
  });

  it('주변 검색 필터 행이 있으면 시트를 필터 행 아래에 배치한다', () => {
    mockUseNearbyRestaurants.mockReturnValue({
      data: [createPlace({ id: 'place-1', place_name: '첫 번째 식당' })],
      isLoading: false,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 768,
    });
    appendSheetBoundary(220);

    renderSheet({ clientX: 900, clientY: 90 });

    const sheet = screen.getByRole('button', { name: '닫기' }).parentElement;

    expect(sheet).toHaveAttribute('data-placement', 'below');
    expect(sheet).toHaveStyle({ '--sheet-top': '236px' });
  });
});
