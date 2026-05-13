import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET } from './route';

const makeRequest = (
  params: Record<string, string>,
  clientIp = '203.0.113.40',
) => {
  const url = new URL('http://localhost/api/search/nearby');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), {
    headers: { 'x-real-ip': clientIp },
  });
};

const mockFetch = (options: { ok: boolean; body?: unknown }) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: options.ok,
      json: async () => options.body ?? {},
    }),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('GET /api/search/nearby', () => {
  it('returns 500 when GOOGLE_MAPS_API_KEY is missing', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', '');
    const res = await GET(makeRequest({ x: '127.0', y: '37.5' }));
    expect(res.status).toBe(500);
  });

  it('returns 400 when x or y is missing', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    const res = await GET(makeRequest({ x: '127.0' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid latitude (NaN)', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    const res = await GET(makeRequest({ x: '127.0', y: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for latitude out of range', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    const res = await GET(makeRequest({ x: '127.0', y: '100' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid longitude', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    const res = await GET(makeRequest({ x: '200', y: '37.5' }));
    expect(res.status).toBe(400);
  });

  it('clamps radius to valid range', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({ ok: true, body: { places: [] } });
    const res = await GET(
      makeRequest({ x: '127.0', y: '37.5', radius: '-100' }),
    );
    expect(res.status).toBe(200);
    const capturedBody = JSON.parse(
      (vi.mocked(global.fetch).mock.calls[0][1] as { body: string }).body,
    );
    expect(
      capturedBody.locationRestriction.circle.radius,
    ).toBeGreaterThanOrEqual(1);
  });

  it('falls back to all cuisine for invalid cuisine param', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({ ok: true, body: { places: [] } });
    await GET(makeRequest({ x: '127.0', y: '37.5', cuisine: 'invalid' }));
    const capturedBody = JSON.parse(
      (vi.mocked(global.fetch).mock.calls[0][1] as { body: string }).body,
    );
    expect(capturedBody.includedTypes).toContain('restaurant');
  });

  it('returns 500 when Google API responds with non-2xx', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({ ok: false });
    const res = await GET(makeRequest({ x: '127.0', y: '37.5' }));
    expect(res.status).toBe(500);
  });

  it('returns empty documents when places is undefined', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({ ok: true, body: {} });
    const res = await GET(makeRequest({ x: '127.0', y: '37.5' }));
    const data = await res.json();
    expect(data.documents).toEqual([]);
  });

  it('normalizes place data correctly', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({
      ok: true,
      body: {
        places: [
          {
            id: 'abc123',
            displayName: { text: '테스트 식당' },
            formattedAddress: '서울시 강남구',
            location: { latitude: 37.5, longitude: 127.0 },
          },
        ],
      },
    });
    const res = await GET(makeRequest({ x: '127.0', y: '37.5' }));
    const data = await res.json();
    expect(data.documents).toHaveLength(1);
    expect(data.documents[0].id).toBe('abc123');
    expect(data.documents[0].place_name).toBe('테스트 식당');
  });

  it('rate limits repeated nearby searches from the same client', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key');
    mockFetch({ ok: true, body: { places: [] } });

    for (let requestCount = 0; requestCount < 30; requestCount += 1) {
      const res = await GET(
        makeRequest({ x: '127.0', y: '37.5' }, '203.0.113.41'),
      );
      expect(res.status).toBe(200);
    }

    const res = await GET(
      makeRequest({ x: '127.0', y: '37.5' }, '203.0.113.41'),
    );
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe('too_many_requests');
    expect(global.fetch).toHaveBeenCalledTimes(30);
  });
});
