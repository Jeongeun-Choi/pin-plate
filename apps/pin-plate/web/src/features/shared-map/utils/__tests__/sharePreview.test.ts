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

  it('injects Google Maps configuration into the SST production environment', () => {
    const sstConfig = readFileSync(
      resolve(process.cwd(), '../../../sst.config.ts'),
      'utf8',
    );

    expect(sstConfig).toContain(
      'const googleMapsApiKey = new sst.Secret("GoogleMapsApiKey")',
    );
    expect(sstConfig).toContain(
      'const googleMapsBrowserApiKey = new sst.Secret("GoogleMapsBrowserApiKey")',
    );
    expect(sstConfig).toContain(
      'const googleMapsMapId = new sst.Secret("GoogleMapsMapId")',
    );
    expect(sstConfig).toContain('GOOGLE_MAPS_API_KEY: googleMapsApiKey.value');
    expect(sstConfig).toContain(
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: googleMapsBrowserApiKey.value',
    );
    expect(sstConfig).toContain(
      'NEXT_PUBLIC_GOOGLE_MAPS_ID: googleMapsMapId.value',
    );
  });

  it('injects Supabase configuration into the SST production environment', () => {
    const sstConfig = readFileSync(
      resolve(process.cwd(), '../../../sst.config.ts'),
      'utf8',
    );

    expect(sstConfig).toContain(
      'const supabaseUrl = new sst.Secret("SupabaseUrl")',
    );
    expect(sstConfig).toContain(
      'const supabaseApiKey = new sst.Secret("SupabaseApiKey")',
    );
    expect(sstConfig).toContain(
      'const supabaseSecretKey = new sst.Secret("SupabaseSecretKey")',
    );
    expect(sstConfig).toContain('NEXT_PUBLIC_SUPABASE_URL: supabaseUrl.value');
    expect(sstConfig).toContain(
      'NEXT_PUBLIC_SUPABASE_API_KEY: supabaseApiKey.value',
    );
    expect(sstConfig).toContain('\n        SUPABASE_URL: supabaseUrl.value,');
    expect(sstConfig).toContain(
      '\n        SUPABASE_API_KEY: supabaseApiKey.value,',
    );
    expect(sstConfig).toContain(
      '\n        SUPABASE_SECRET_KEY: supabaseSecretKey.value,',
    );
  });

  it('sets Google Maps SST secrets from GitHub Actions before deploy', () => {
    const deployWorkflow = readFileSync(
      resolve(process.cwd(), '../../../.github/workflows/deploy.yml'),
      'utf8',
    );

    expect(deployWorkflow).toContain(
      'GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}',
    );
    expect(deployWorkflow).toContain(
      'GOOGLE_MAPS_BROWSER_API_KEY: ${{ secrets.GOOGLE_MAPS_BROWSER_API_KEY }}',
    );
    expect(deployWorkflow).toContain(
      'GOOGLE_MAPS_MAP_ID: ${{ secrets.GOOGLE_MAPS_MAP_ID }}',
    );
    expect(deployWorkflow).toContain(
      'pnpm sst secret set GoogleMapsApiKey "$GOOGLE_MAPS_API_KEY" --stage production',
    );
    expect(deployWorkflow).toContain(
      'pnpm sst secret set GoogleMapsBrowserApiKey "$GOOGLE_MAPS_BROWSER_API_KEY" --stage production',
    );
    expect(deployWorkflow).toContain(
      'pnpm sst secret set GoogleMapsMapId "$GOOGLE_MAPS_MAP_ID" --stage production',
    );
  });

  it('sets Supabase public SST secrets from GitHub Actions before deploy', () => {
    const deployWorkflow = readFileSync(
      resolve(process.cwd(), '../../../.github/workflows/deploy.yml'),
      'utf8',
    );

    expect(deployWorkflow).toContain(
      'NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}',
    );
    expect(deployWorkflow).toContain(
      'NEXT_PUBLIC_SUPABASE_API_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_API_KEY }}',
    );
    expect(deployWorkflow).toContain(
      ': "${SUPABASE_URL:?Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL GitHub secret}"',
    );
    expect(deployWorkflow).toContain(
      ': "${SUPABASE_API_KEY:?Missing SUPABASE_API_KEY or NEXT_PUBLIC_SUPABASE_API_KEY GitHub secret}"',
    );
    expect(deployWorkflow).toContain(
      ': "${SUPABASE_SECRET_KEY:?Missing SUPABASE_SECRET_KEY GitHub secret}"',
    );
    expect(deployWorkflow).toContain(
      'pnpm sst secret set SupabaseUrl "$SUPABASE_URL" --stage production',
    );
    expect(deployWorkflow).toContain(
      'pnpm sst secret set SupabaseApiKey "$SUPABASE_API_KEY" --stage production',
    );
    expect(deployWorkflow).toContain(
      'pnpm sst secret set SupabaseSecretKey "$SUPABASE_SECRET_KEY" --stage production',
    );
  });
});
