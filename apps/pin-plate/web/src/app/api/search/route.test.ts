import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const makeRequest = (
  params: Record<string, string>,
  clientIp = '203.0.113.30',
) => {
  const url = new URL('http://localhost/api/search');
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  return new Request(url.toString(), {
    headers: { 'x-real-ip': clientIp },
  });
};

const mockFetch = (options: { body?: unknown }) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => options.body ?? {},
    }),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('GET /api/search', () => {
  it('returns an empty response without calling Google when query is missing', async () => {
    mockFetch({});

    const res = await GET(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.documents).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rate limits repeated text searches from the same client', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({ body: { places: [] } });

    for (let requestCount = 0; requestCount < 30; requestCount += 1) {
      const res = await GET(makeRequest({ query: '김밥' }, '203.0.113.31'));
      expect(res.status).toBe(200);
    }

    const res = await GET(makeRequest({ query: '김밥' }, '203.0.113.31'));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe('too_many_requests');
    expect(global.fetch).toHaveBeenCalledTimes(30);
  });
});
