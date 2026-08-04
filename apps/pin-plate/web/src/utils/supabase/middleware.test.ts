import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateSession } from './middleware';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

const mockCreateServerClient = vi.mocked(createServerClient);
const originalFetch = globalThis.fetch;

const makeRequest = (path: string, cookie?: string) =>
  new NextRequest(new URL(path, 'https://pinonplate.com'), {
    headers: cookie ? { Cookie: cookie } : undefined,
  });

const mockSessionFailure = () => {
  mockCreateServerClient.mockImplementation(() => {
    throw new Error('invalid auth cookie');
  });
};

const mockBetterAuthSession = (body: unknown, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        status,
      }),
    ),
  );
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', originalFetch);
});

describe('updateSession fail-closed behavior', () => {
  it('allows public paths when session handling throws', async () => {
    mockSessionFailure();

    const response = await updateSession(makeRequest('/share/seongsu-map'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('returns 401 for protected API paths when session handling throws', async () => {
    mockSessionFailure();

    const response = await updateSession(makeRequest('/api/search?query=cafe'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('redirects protected pages to sign-in when session handling throws', async () => {
    mockSessionFailure();

    const response = await updateSession(makeRequest('/my-page'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://pinonplate.com/sign-in',
    );
  });
});

describe('updateSession Better Auth behavior', () => {
  it('allows protected pages when a Better Auth session cookie is valid', async () => {
    mockBetterAuthSession({ user: { id: 'better-user-1' } });

    const response = await updateSession(
      makeRequest('/', 'pin-plate.session_token=session-token'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });

  it('redirects sign-in to home when a Better Auth session cookie is valid', async () => {
    mockBetterAuthSession({ user: { id: 'better-user-1' } });

    const response = await updateSession(
      makeRequest('/sign-in', 'pin-plate.session_token=session-token'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://pinonplate.com/');
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });

  it('keeps auth callback public even when a Better Auth session exists', async () => {
    mockBetterAuthSession({ user: { id: 'better-user-1' } });

    const response = await updateSession(
      makeRequest(
        '/auth/callback?provider=better-auth&popup=true',
        'pin-plate.session_token=session-token',
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });
});
