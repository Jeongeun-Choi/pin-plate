import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { updateSession } from './middleware';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

const mockCreateServerClient = vi.mocked(createServerClient);

const makeRequest = (path: string) =>
  new NextRequest(new URL(path, 'https://pinonplate.com'));

const mockSessionFailure = () => {
  mockCreateServerClient.mockImplementation(() => {
    throw new Error('invalid auth cookie');
  });
};

afterEach(() => {
  vi.clearAllMocks();
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
