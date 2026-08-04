import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const mockCreateAdminClient = vi.mocked(createAdminClient);

const { mockGetUser, mockFrom, mockSelect, mockEqUserId, mockOrder } =
  vi.hoisted(() => ({
    mockGetUser: vi.fn(),
    mockFrom: vi.fn(),
    mockSelect: vi.fn(),
    mockEqUserId: vi.fn(),
    mockOrder: vi.fn(),
  }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('GET /api/places', () => {
  it('reads places with the Better Auth session user id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: 'better-user-1' } }),
      }),
    );
    mockOrder.mockResolvedValue({
      data: [
        {
          id: 'place-1',
          user_id: 'better-user-1',
          posts: [
            { id: 1, rating: 5, image_urls: [], created_at: '2026-01-01' },
          ],
        },
      ],
      error: null,
    });
    mockEqUserId.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEqUserId });
    mockFrom.mockReturnValue({ select: mockSelect });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
    } as never);
    mockCreateAdminClient.mockReturnValue({
      from: mockFrom,
    } as never);

    const response = await GET(
      new Request('http://localhost/api/places', {
        headers: { cookie: 'pin-plate.session_token=session-token' },
      }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('places');
    expect(mockEqUserId).toHaveBeenCalledWith('user_id', 'better-user-1');
    expect(data[0]).toMatchObject({
      id: 'place-1',
      user_id: 'better-user-1',
      visit_count: 1,
      avg_rating: 5,
    });
  });
});
