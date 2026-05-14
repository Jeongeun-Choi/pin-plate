import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSharePreview } from '../sharePreview';

describe('buildSharePreview', () => {
  it('builds title and description with an absolute raster fallback image', () => {
    expect(
      buildSharePreview({
        title: '성수 카페 지도',
        description: '',
        placeCount: 3,
        coverImageUrl: null,
      }),
    ).toEqual({
      title: '성수 카페 지도 | Pin Plate',
      description: '추천 장소 3곳을 지도와 리스트로 확인해 보세요.',
      imageUrl: 'https://pinonplate.com/og-default.png',
    });
  });

  it('uses custom description and cover image when present', () => {
    expect(
      buildSharePreview({
        title: '데이트 맛집',
        description: '조용하고 맛있는 곳만 모았어요.',
        placeCount: 2,
        coverImageUrl: 'https://example.com/cover.jpg',
      }),
    ).toEqual({
      title: '데이트 맛집 | Pin Plate',
      description: '조용하고 맛있는 곳만 모았어요.',
      imageUrl: 'https://example.com/cover.jpg',
    });
  });
});

describe('share preview deployment config', () => {
  it('sets the production site URL for SST share metadata', () => {
    const sstConfig = readFileSync(
      resolve(process.cwd(), '../../../sst.config.ts'),
      'utf8',
    );

    expect(sstConfig).toContain(
      'NEXT_PUBLIC_SITE_URL: "https://pinonplate.com"',
    );
  });
});
