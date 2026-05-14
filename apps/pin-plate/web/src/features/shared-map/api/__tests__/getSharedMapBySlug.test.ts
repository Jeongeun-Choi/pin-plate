import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminClient } from '@/utils/supabase/admin';
import { getSharedMapBySlug } from '../getSharedMapBySlug';

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

interface SharedMapFetchQuery {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
}

const mockCreateAdminClient = createAdminClient as unknown as ReturnType<
  typeof vi.fn
>;

const createFetchQuery = (result: unknown): SharedMapFetchQuery => {
  const fetchQuery: SharedMapFetchQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
  };
  fetchQuery.select.mockReturnValue(fetchQuery);
  fetchQuery.eq.mockReturnValue(fetchQuery);

  return fetchQuery;
};

describe('getSharedMapBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for a missing slug', async () => {
    const fetchQuery = createFetchQuery({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });
    mockCreateAdminClient.mockReturnValue({ from: vi.fn(() => fetchQuery) });

    await expect(getSharedMapBySlug('missing-map')).resolves.toBeNull();
  });

  it('propagates non-missing slug fetch errors', async () => {
    const fetchError = new Error('database unavailable');
    const fetchQuery = createFetchQuery({ data: null, error: fetchError });
    mockCreateAdminClient.mockReturnValue({ from: vi.fn(() => fetchQuery) });

    await expect(getSharedMapBySlug('broken-map')).rejects.toThrow(
      'database unavailable',
    );
  });

  it('returns shared places ordered by sort order', async () => {
    const fetchQuery = createFetchQuery({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        owner_id: '22222222-2222-4222-8222-222222222222',
        slug: 'seongsu-kape-cuceon-12345678',
        title: '성수 카페 추천',
        description: '',
        criteria_type: 'tag',
        criteria_value: '카페',
        place_count: 2,
        cover_image_url: null,
        created_at: '2026-05-13T00:00:00.000Z',
        shared_map_places: [
          { id: 'shared-place-2', sort_order: 2 },
          { id: 'shared-place-1', sort_order: 1 },
        ],
      },
      error: null,
    });
    mockCreateAdminClient.mockReturnValue({ from: vi.fn(() => fetchQuery) });

    const sharedMap = await getSharedMapBySlug('seongsu-kape-cuceon-12345678');

    expect(createAdminClient).toHaveBeenCalled();
    expect(sharedMap?.shared_map_places.map((place) => place.id)).toEqual([
      'shared-place-1',
      'shared-place-2',
    ]);
  });
});
