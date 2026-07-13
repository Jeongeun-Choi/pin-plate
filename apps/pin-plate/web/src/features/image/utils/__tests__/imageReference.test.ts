import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildPublicImageUrl,
  getTrustedImageKeyFromUrl,
  getTrustedImageUrl,
  isTrustedImageKey,
  isTrustedUserImageKey,
} from '../imageReference';

const TEST_IMAGE_ORIGIN = 'https://image.test';

describe('imageReference', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds a public URL from a trusted key and configured base URL', () => {
    vi.stubEnv('IMAGE_PUBLIC_BASE_URL', `${TEST_IMAGE_ORIGIN}/`);

    expect(buildPublicImageUrl('uploads/users/user-1/photo.webp')).toBe(
      `${TEST_IMAGE_ORIGIN}/uploads/users/user-1/photo.webp`,
    );
  });

  it('falls back to the configured S3 bucket origin when no image base URL is set', () => {
    vi.stubEnv('NEXT_PUBLIC_AWS_S3_BUCKET_NAME', 'example-upload-bucket');
    vi.stubEnv('NEXT_PUBLIC_AWS_REGION', 'example-region-1');

    expect(buildPublicImageUrl('uploads/users/user-1/photo.webp')).toBe(
      'https://example-upload-bucket.s3.dualstack.example-region-1.amazonaws.com/uploads/users/user-1/photo.webp',
    );
  });

  it('accepts only relative upload keys with allowed image extensions', () => {
    expect(isTrustedImageKey('uploads/users/user-1/photo.webp')).toBe(true);
    expect(isTrustedImageKey('uploads/users/user-1/photo.svg')).toBe(false);
    expect(isTrustedImageKey('https://evil.test/photo.webp')).toBe(false);
    expect(isTrustedImageKey('/uploads/users/user-1/photo.webp')).toBe(false);
    expect(isTrustedImageKey('uploads/users/user-1/../photo.webp')).toBe(false);
  });

  it('accepts only keys for the current user prefix', () => {
    expect(
      isTrustedUserImageKey('uploads/users/user-1/photo.webp', 'user-1'),
    ).toBe(true);
    expect(
      isTrustedUserImageKey('uploads/users/user-2/photo.webp', 'user-1'),
    ).toBe(false);
  });

  it('trusts public URLs only when they map to the configured public origin and upload path', () => {
    vi.stubEnv('IMAGE_PUBLIC_BASE_URL', TEST_IMAGE_ORIGIN);

    expect(
      getTrustedImageUrl(
        `${TEST_IMAGE_ORIGIN}/uploads/users/user-1/photo.webp`,
      ),
    ).toBe(`${TEST_IMAGE_ORIGIN}/uploads/users/user-1/photo.webp`);
    expect(
      getTrustedImageUrl('https://evil.test/uploads/users/user-1/photo.webp'),
    ).toBeNull();
    expect(
      getTrustedImageUrl(`${TEST_IMAGE_ORIGIN}/private/photo.webp`),
    ).toBeNull();
  });

  it('extracts a trusted key from a trusted public URL', () => {
    vi.stubEnv('IMAGE_PUBLIC_BASE_URL', TEST_IMAGE_ORIGIN);

    expect(
      getTrustedImageKeyFromUrl(
        `${TEST_IMAGE_ORIGIN}/uploads/users/user-1/photo.webp`,
      ),
    ).toBe('uploads/users/user-1/photo.webp');
  });

  it('normalizes trusted regional S3 URLs to the optimizable dualstack origin', () => {
    vi.stubEnv('NEXT_PUBLIC_AWS_S3_BUCKET_NAME', 'example-upload-bucket');
    vi.stubEnv('NEXT_PUBLIC_AWS_REGION', 'example-region-1');

    expect(
      getTrustedImageUrl(
        'https://example-upload-bucket.s3.example-region-1.amazonaws.com/uploads/users/user-1/photo.webp',
      ),
    ).toBe(
      'https://example-upload-bucket.s3.dualstack.example-region-1.amazonaws.com/uploads/users/user-1/photo.webp',
    );
  });
});
