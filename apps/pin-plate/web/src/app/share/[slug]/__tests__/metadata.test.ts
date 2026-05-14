import { describe, expect, it, vi } from 'vitest';
import type { SharedMap } from '@/features/shared-map/types/sharedMap';
import { getSharedMapBySlug } from '@/features/shared-map/api/getSharedMapBySlug';

const sharedMapFixture: SharedMap = {
  id: 'map-1',
  owner_id: 'user-1',
  slug: 'seongsu-cafe',
  title: '성수 카페 지도',
  description: '',
  criteria_type: 'tag',
  criteria_value: '작업/공부',
  place_count: 2,
  cover_image_url: 'https://example.com/cover.jpg',
  created_at: '2026-05-13T00:00:00.000Z',
  shared_map_places: [],
};

vi.mock('@/features/shared-map/api/getSharedMapBySlug', () => ({
  getSharedMapBySlug: vi.fn(),
}));

const mockedGetSharedMapBySlug = vi.mocked(getSharedMapBySlug);
const { generateMetadata } = await import('../page');

describe('share page metadata', () => {
  it('returns Open Graph and Twitter preview metadata', async () => {
    mockedGetSharedMapBySlug.mockResolvedValueOnce(sharedMapFixture);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(mockedGetSharedMapBySlug).toHaveBeenCalledWith('seongsu-cafe');
    expect(metadata).toMatchObject({
      title: '성수 카페 지도 | Pin Plate',
      description: '추천 장소 2곳을 지도와 리스트로 확인해 보세요.',
      openGraph: {
        title: '성수 카페 지도 | Pin Plate',
        description: '추천 장소 2곳을 지도와 리스트로 확인해 보세요.',
        images: [{ url: 'https://example.com/cover.jpg' }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: '성수 카페 지도 | Pin Plate',
        description: '추천 장소 2곳을 지도와 리스트로 확인해 보세요.',
        images: ['https://example.com/cover.jpg'],
      },
    });
  });

  it('returns missing metadata when the slug is not found', async () => {
    mockedGetSharedMapBySlug.mockResolvedValueOnce(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'missing-map' }),
    });

    expect(metadata.title).toBe('공유 지도를 찾을 수 없어요 | Pin Plate');
  });

  it('uses an absolute raster fallback image when the shared map has no cover image', async () => {
    mockedGetSharedMapBySlug.mockResolvedValueOnce({
      ...sharedMapFixture,
      cover_image_url: null,
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'http://localhost:3000/og-default.png' },
    ]);
    expect(metadata.twitter?.images).toEqual([
      'http://localhost:3000/og-default.png',
    ]);
  });
});
