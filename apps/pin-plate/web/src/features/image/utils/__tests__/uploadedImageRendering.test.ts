import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('uploaded image rendering', () => {
  it('generates Next image optimizer srcSets for uploaded card images', () => {
    const placeListSource = readSource(
      'src/features/place-list/components/PlaceList.tsx',
    );

    expect(placeListSource).toContain("from 'next/image'");
    expect(placeListSource).toContain('getImageProps');
  });

  it('keeps uploaded detail and form images optimized', () => {
    const postFormSource = readSource(
      'src/features/post/components/PostForm.tsx',
    );
    const editPostContentSource = readSource(
      'src/features/post/components/EditPostContent.tsx',
    );
    const postDetailContentSource = readSource(
      'src/features/post/components/PostDetailContent.tsx',
    );

    expect(postFormSource).not.toContain('unoptimized');
    expect(editPostContentSource).not.toContain('unoptimized');
    expect(postDetailContentSource).not.toContain('unoptimized');
  });

  it('allowlists dualstack S3 upload origins for the Next image optimizer', () => {
    const nextConfigSource = readSource('next.config.mjs');

    expect(nextConfigSource).toContain('s3.dualstack');
  });
});
