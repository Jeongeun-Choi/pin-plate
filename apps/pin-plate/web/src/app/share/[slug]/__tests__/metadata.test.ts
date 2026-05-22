import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SharedMap } from '@/features/shared-map/types/sharedMap';
import { getSharedMapBySlug } from '@/features/shared-map/api/getSharedMapBySlug';

const TEST_IMAGE_ORIGIN = 'https://image.test';
const TEST_COVER_IMAGE_URL = `${TEST_IMAGE_ORIGIN}/uploads/users/test-user/cover.jpg`;

const sharedMapFixture: SharedMap = {
  id: 'map-1',
  owner_id: 'user-1',
  slug: 'seongsu-cafe',
  title: '성수 카페 지도',
  description: '',
  criteria_type: 'tag',
  criteria_value: '작업/공부',
  place_count: 2,
  cover_image_url: TEST_COVER_IMAGE_URL,
  created_at: '2026-05-13T00:00:00.000Z',
  shared_map_places: [],
};

vi.mock('@/features/shared-map/api/getSharedMapBySlug', () => ({
  getSharedMapBySlug: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('notFound called');
  }),
}));

const mockedGetSharedMapBySlug = vi.mocked(getSharedMapBySlug);
const { default: SharePage, generateMetadata } = await import('../page');
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalImagePublicBaseUrl = process.env.IMAGE_PUBLIC_BASE_URL;

describe('share page metadata', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
    if (originalImagePublicBaseUrl === undefined) {
      delete process.env.IMAGE_PUBLIC_BASE_URL;
      return;
    }
    process.env.IMAGE_PUBLIC_BASE_URL = originalImagePublicBaseUrl;
  });

  it('returns Open Graph preview metadata without Twitter metadata', async () => {
    process.env.IMAGE_PUBLIC_BASE_URL = TEST_IMAGE_ORIGIN;
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
        images: [
          {
            url: TEST_COVER_IMAGE_URL,
          },
        ],
        url: 'https://pinonplate.com/share/seongsu-cafe',
        siteName: 'Pin Plate',
        type: 'website',
      },
    });
    expect(metadata.twitter).toBeUndefined();
    expect(fetchSharedMapCoverImage).toHaveBeenCalledWith(
      TEST_COVER_IMAGE_URL,
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
      { url: 'https://pinonplate.com/og-default.png' },
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
    process.env.IMAGE_PUBLIC_BASE_URL = TEST_IMAGE_ORIGIN;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );
    mockedGetSharedMapBySlug.mockResolvedValueOnce(sharedMapFixture);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://pinonplate.com/og-default.png' },
    ]);
    expect(metadata.twitter).toBeUndefined();
  });

  it('uses the fallback image when the cover image response is not ok', async () => {
    process.env.IMAGE_PUBLIC_BASE_URL = TEST_IMAGE_ORIGIN;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );
    mockedGetSharedMapBySlug.mockResolvedValueOnce(sharedMapFixture);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://pinonplate.com/og-default.png' },
    ]);
    expect(metadata.twitter).toBeUndefined();
  });

  it('uses the fallback image when the cover image is not an image response', async () => {
    process.env.IMAGE_PUBLIC_BASE_URL = TEST_IMAGE_ORIGIN;
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
      { url: 'https://pinonplate.com/og-default.png' },
    ]);
    expect(metadata.twitter).toBeUndefined();
  });

  it('uses the fallback image without fetch when the cover image URL is not trusted', async () => {
    process.env.IMAGE_PUBLIC_BASE_URL = TEST_IMAGE_ORIGIN;
    const fetchSharedMapCoverImage = vi.fn();
    vi.stubGlobal('fetch', fetchSharedMapCoverImage);
    mockedGetSharedMapBySlug.mockResolvedValueOnce({
      ...sharedMapFixture,
      cover_image_url: 'https://evil.test/cover.jpg',
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(fetchSharedMapCoverImage).not.toHaveBeenCalled();
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://pinonplate.com/og-default.png' },
    ]);
  });
});

describe('share page missing state', () => {
  it('renders a missing shared map page without calling notFound', async () => {
    mockedGetSharedMapBySlug.mockResolvedValueOnce(null);

    render(
      await SharePage({
        params: Promise.resolve({ slug: 'missing-map' }),
      }),
    );

    expect(
      screen.getByRole('heading', { name: '공유 지도를 찾을 수 없어요' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
