import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getMyProfile } from '../getMyProfile';

describe('getMyProfile', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('normalizes profile responses that only contain current database columns', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'user-1',
          nickname: '맛집러',
          email: 'user@example.com',
        }),
        { status: 200 },
      ),
    );

    await expect(getMyProfile()).resolves.toEqual({
      id: 'user-1',
      nickname: '맛집러',
      name: null,
      image_url: null,
      email: 'user@example.com',
    });
  });

  it('returns null for unauthenticated profile requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    );

    await expect(getMyProfile()).resolves.toBeNull();
  });
});
