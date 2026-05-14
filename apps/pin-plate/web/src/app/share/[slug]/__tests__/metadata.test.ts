import { afterEach, describe, expect, it, vi } from 'vitest';
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
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

describe('share page metadata', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      return;
    }
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it('returns Open Graph preview metadata without Twitter metadata', async () => {
    const fetchSharedMapCoverImage = vi.fn().mockResolvedValue(
      new Response(null, {
        headers: { 'content-type': 'image/jpeg' },
        status: 200,
      }),
    );
    vi.stubGlobal('fetch', fetchSharedMapCoverImage);
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
        url: 'http://localhost:3000/share/seongsu-cafe',
        siteName: 'Pin Plate',
        type: 'website',
      },
    });
    expect(metadata.twitter).toBeUndefined();
    expect(fetchSharedMapCoverImage).toHaveBeenCalledWith(
      'https://example.com/cover.jpg',
      expect.objectContaining({ method: 'HEAD' }),
    );
  });

  it('returns missing metadata when the slug is not found', async () => {
    mockedGetSharedMapBySlug.mockResolvedValueOnce(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'missing-map' }),
    });

    expect(metadata.title).toBe('공유 지도를 찾을 수 없어요 | Pin Plate');
  });

  it('uses an absolute raster fallback image when the shared map has no cover image', async () => {
    const fetchSharedMapCoverImage = vi.fn();
    vi.stubGlobal('fetch', fetchSharedMapCoverImage);
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
    expect(metadata.twitter).toBeUndefined();
    expect(fetchSharedMapCoverImage).not.toHaveBeenCalled();
  });

  it('uses the configured site URL for the canonical share URL and fallback image', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://pinonplate.com/';
    const fetchSharedMapCoverImage = vi.fn();
    vi.stubGlobal('fetch', fetchSharedMapCoverImage);
    mockedGetSharedMapBySlug.mockResolvedValueOnce({
      ...sharedMapFixture,
      cover_image_url: null,
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.url).toBe(
      'https://pinonplate.com/share/seongsu-cafe',
    );
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://pinonplate.com/og-default.png' },
    ]);
    expect(fetchSharedMapCoverImage).not.toHaveBeenCalled();
  });

  it('uses the fallback image when the cover image request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );
    mockedGetSharedMapBySlug.mockResolvedValueOnce(sharedMapFixture);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'http://localhost:3000/og-default.png' },
    ]);
    expect(metadata.twitter).toBeUndefined();
  });

  it('uses the fallback image when the cover image response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );
    mockedGetSharedMapBySlug.mockResolvedValueOnce(sharedMapFixture);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'http://localhost:3000/og-default.png' },
    ]);
    expect(metadata.twitter).toBeUndefined();
  });

  it('uses the fallback image when the cover image is not an image response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, {
          headers: { 'content-type': 'text/html' },
          status: 200,
        }),
      ),
    );
    mockedGetSharedMapBySlug.mockResolvedValueOnce(sharedMapFixture);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'http://localhost:3000/og-default.png' },
    ]);
    expect(metadata.twitter).toBeUndefined();
  });
});
