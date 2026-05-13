import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createClient } from '@/utils/supabase/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const mockCreatePresignedPost = vi.mocked(createPresignedPost);

const stubImageEnv = () => {
  vi.stubEnv('NEXT_PUBLIC_AWS_REGION', 'ap-northeast-2');
  vi.stubEnv('S3_ACCESS_KEY_ID', 'test-access-key');
  vi.stubEnv('S3_SECRET_ACCESS_KEY', 'test-secret-key');
  vi.stubEnv('NEXT_PUBLIC_AWS_S3_BUCKET_NAME', 'test-bucket');
};

const mockAuthenticatedUser = (user: { id: string } | null) => {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
  } as never);
};

const makeRequest = (body: unknown, headers?: Record<string, string>) =>
  new Request('http://localhost/api/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '203.0.113.10',
      ...headers,
    },
    body: JSON.stringify(body),
  });

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('POST /api/image', () => {
  it('creates a guest upload session and presigned posts when the user is logged out', async () => {
    stubImageEnv();
    mockAuthenticatedUser(null);
    mockCreatePresignedPost.mockResolvedValue({
      url: 'https://s3.example.com',
      fields: { key: 'value' },
    } as never);

    const res = await POST(
      makeRequest({
        files: [{ filename: 'dish.webp', type: 'image/webp' }],
      }) as never,
    );

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain(
      'pin_plate_guest_upload_session=',
    );
    expect(data.urls[0]).toMatchObject({
      originalName: 'dish.webp',
      url: 'https://s3.example.com',
      fields: { key: 'value' },
    });
    expect(mockCreatePresignedPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        Key: expect.stringMatching(/^uploads\/guests\/.+\/.+\.webp$/),
      }),
    );
  });

  it('creates S3 presigned posts for authenticated image uploads', async () => {
    stubImageEnv();
    mockAuthenticatedUser({ id: 'user-1' });
    mockCreatePresignedPost.mockResolvedValue({
      url: 'https://s3.example.com',
      fields: { key: 'value' },
    } as never);

    const res = await POST(
      makeRequest({
        files: [{ filename: 'dish.webp', type: 'image/webp' }],
      }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.urls[0]).toMatchObject({
      originalName: 'dish.webp',
      url: 'https://s3.example.com',
      fields: { key: 'value' },
    });
    expect(mockCreatePresignedPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        Key: expect.stringMatching(/^uploads\/users\/user-1\/.+\.webp$/),
      }),
    );
  });

  it('rejects svg uploads even though they are image MIME types', async () => {
    stubImageEnv();
    mockAuthenticatedUser(null);

    const res = await POST(
      makeRequest({
        files: [{ filename: 'unsafe.svg', type: 'image/svg+xml' }],
      }) as never,
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Unsupported image type');
    expect(mockCreatePresignedPost).not.toHaveBeenCalled();
  });

  it('rate limits repeated guest upload requests by the guest session', async () => {
    stubImageEnv();
    mockAuthenticatedUser(null);
    mockCreatePresignedPost.mockResolvedValue({
      url: 'https://s3.example.com',
      fields: { key: 'value' },
    } as never);

    const firstRes = await POST(
      makeRequest({
        files: [{ filename: 'dish.webp', type: 'image/webp' }],
      }) as never,
    );
    const guestCookie = firstRes.headers.get('set-cookie')?.split(';')[0];
    expect(guestCookie).toContain('pin_plate_guest_upload_session=');

    for (let requestCount = 1; requestCount < 20; requestCount += 1) {
      const res = await POST(
        makeRequest(
          {
            files: [
              { filename: `dish-${requestCount}.webp`, type: 'image/webp' },
            ],
          },
          { Cookie: guestCookie ?? '' },
        ) as never,
      );
      expect(res.status).toBe(200);
    }

    const limitedRes = await POST(
      makeRequest(
        { files: [{ filename: 'limited.webp', type: 'image/webp' }] },
        { Cookie: guestCookie ?? '' },
      ) as never,
    );
    const data = await limitedRes.json();

    expect(limitedRes.status).toBe(429);
    expect(data.error).toBe('Too many requests');
  });

  it('accepts a server-issued guest session token from the mobile upload header', async () => {
    stubImageEnv();
    mockAuthenticatedUser(null);
    mockCreatePresignedPost.mockResolvedValue({
      url: 'https://s3.example.com',
      fields: { key: 'value' },
    } as never);

    const firstRes = await POST(
      makeRequest({
        files: [{ filename: 'web.webp', type: 'image/webp' }],
      }) as never,
    );
    const guestToken = firstRes.headers
      .get('set-cookie')
      ?.match(/pin_plate_guest_upload_session=([^;]+)/)?.[1];

    const mobileRes = await POST(
      makeRequest(
        { files: [{ filename: 'mobile.png', type: 'image/png' }] },
        { 'X-Pin-Plate-Guest-Session': guestToken ?? '' },
      ) as never,
    );

    expect(mobileRes.status).toBe(200);
    expect(mockCreatePresignedPost).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        Key: expect.stringMatching(/^uploads\/guests\/.+\/.+\.png$/),
      }),
    );
  });
});
