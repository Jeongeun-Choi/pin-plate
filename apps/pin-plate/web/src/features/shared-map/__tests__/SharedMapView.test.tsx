import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SharedMap } from '../types/sharedMap';
import { SharedMapView } from '../components/SharedMapView';

vi.mock('../components/SharedMapCanvas', () => ({
  SharedMapCanvas: ({ places }: { places: SharedMap['shared_map_places'] }) => (
    <div data-testid="shared-map-canvas">{places.length}개의 지도 핀</div>
  ),
}));

vi.mock('../components/SaveSharedPlaceButton', () => ({
  SaveSharedPlaceButton: () => <button type="button">저장</button>,
}));

const sharedMap: SharedMap = {
  id: 'shared-map-1',
  owner_id: 'user-1',
  slug: 'seongsu-map',
  title: '성수 추천 지도',
  description: '',
  criteria_type: 'status',
  criteria_value: 'recommend',
  place_count: 2,
  cover_image_url: null,
  created_at: '2026-05-14T00:00:00.000Z',
  shared_map_places: [
    {
      id: 'shared-place-1',
      shared_map_id: 'shared-map-1',
      source_place_id: 'place-1',
      kakao_place_id: 'kakao-1',
      place_name: '성수 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127.1,
      status: 'recommend',
      tags: ['cafe'],
      avg_rating: 4.5,
      first_image: null,
      visit_count: 2,
      sort_order: 0,
      created_at: '2026-05-14T00:00:00.000Z',
    },
    {
      id: 'shared-place-2',
      shared_map_id: 'shared-map-1',
      source_place_id: 'place-2',
      kakao_place_id: 'kakao-2',
      place_name: '서울숲 밥집',
      address: '서울 성동구 서울숲',
      lat: 37.54,
      lng: 127.04,
      status: 'recommend',
      tags: ['date'],
      avg_rating: 4,
      first_image: null,
      visit_count: 1,
      sort_order: 1,
      created_at: '2026-05-14T00:00:00.000Z',
    },
  ],
};

const sharedMapViewCssPath = resolve(
  __dirname,
  '../components/SharedMapView.css.ts',
);

describe('SharedMapView', () => {
  it('presents the shared map as the primary region before the place list', () => {
    render(<SharedMapView sharedMap={sharedMap} />);

    const mapRegion = screen.getByRole('region', { name: '공유 맛집 지도' });
    const placeListPanel = screen.getByRole('complementary', {
      name: '공유 장소 목록',
    });

    expect(mapRegion).toContainElement(screen.getByTestId('shared-map-canvas'));
    expect(
      mapRegion.compareDocumentPosition(placeListPanel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByRole('list', { name: '공유된 추천 장소' }),
    ).toBeInTheDocument();
  });

  it('keeps the map and list content aligned with the shared map header width', () => {
    const sharedMapViewCss = readFileSync(sharedMapViewCssPath, 'utf8');

    expect(sharedMapViewCss).toContain('maxWidth: 1180');
    expect(sharedMapViewCss).not.toContain('maxWidth: 1360');
  });

  it('uses a fixed mobile app shell so only the place list panel scrolls', () => {
    const sharedMapViewCss = readFileSync(sharedMapViewCssPath, 'utf8');

    expect(sharedMapViewCss).toContain("height: '100dvh'");
    expect(sharedMapViewCss).toContain("overflow: 'hidden'");
    expect(sharedMapViewCss).toContain("flex: '1 1 auto'");
    expect(sharedMapViewCss).toContain('flexShrink: 0');
    expect(sharedMapViewCss).toContain("maxHeight: '40dvh'");
    expect(sharedMapViewCss).toContain("overflowY: 'auto'");
    expect(sharedMapViewCss).not.toContain("overflowY: 'visible'");
  });
});
