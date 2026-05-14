import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/utils/supabase/client';
import { createSharedMap } from '../createSharedMap';
import type { CreateSharedMapPayload } from '../../types/sharedMap';

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}));

const sharedMapRow = {
  id: '11111111-1111-4111-8111-111111111111',
  owner_id: '22222222-2222-4222-8222-222222222222',
  slug: 'seongsu-kape-cuceon-12345678123442349234123456789abc',
  title: '성수 카페 추천',
  description: '',
  criteria_type: 'tag',
  criteria_value: '카페',
  place_count: 1,
  cover_image_url: 'https://example.com/cover.jpg',
  created_at: '2026-05-13T00:00:00.000Z',
  shared_map_places: [
    {
      id: '33333333-3333-4333-8333-333333333333',
      shared_map_id: '11111111-1111-4111-8111-111111111111',
      source_place_id: '44444444-4444-4444-8444-444444444444',
      kakao_place_id: 'kakao-0',
      place_name: '장소 0',
      address: '서울 성동구 성수동',
      lat: 37.5,
      lng: 127.1,
      status: 'recommend',
      tags: ['카페'],
      avg_rating: null,
      first_image: 'https://example.com/cover.jpg',
      visit_count: 0,
      sort_order: 0,
      created_at: '2026-05-13T00:00:00.000Z',
    },
  ],
};

const createSourcePlaceId = (index: number) =>
  `44444444-4444-4444-8444-${index.toString().padStart(12, '0')}`;

const createPlace = (index: number) => ({
  id: createSourcePlaceId(index),
  kakao_place_id: `kakao-${index}`,
  place_name: `장소 ${index}`,
  address: '서울 성동구 성수동',
  lat: 37.5 + index / 1000,
  lng: 127.1 + index / 1000,
  status: 'recommend' as const,
  tags: ['카페'],
  avg_rating: null,
  first_image: index === 0 ? 'https://example.com/cover.jpg' : null,
  visit_count: index,
});

const createPayload = (placeCount = 1): CreateSharedMapPayload => ({
  title: '성수 카페 추천',
  description: '',
  criteriaType: 'tag',
  criteriaValue: '카페',
  places: Array.from({ length: placeCount }, (_, index) => createPlace(index)),
});

interface SupabaseRpcClient {
  rpc: ReturnType<typeof vi.fn>;
}

const mockCreateClient = createClient as unknown as ReturnType<typeof vi.fn>;

describe('createSharedMap', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('12345678-1234-4234-9234-123456789abc')
      .mockReturnValue('abcdef12-1234-4234-9234-123456789abc');
  });

  it('creates a shared map snapshot with a single atomic RPC call', async () => {
    const supabaseClient: SupabaseRpcClient = {
      rpc: vi.fn().mockResolvedValue({ data: sharedMapRow, error: null }),
    };
    mockCreateClient.mockReturnValue(supabaseClient);

    const createdSharedMap = await createSharedMap(
      '22222222-2222-4222-8222-222222222222',
      createPayload(),
    );

    expect(supabaseClient.rpc).toHaveBeenCalledWith(
      'create_shared_map_with_places',
      {
        p_cover_image_url: 'https://example.com/cover.jpg',
        p_criteria_type: 'tag',
        p_criteria_value: '카페',
        p_description: '',
        p_owner_id: '22222222-2222-4222-8222-222222222222',
        p_place_count: 1,
        p_places: [
          expect.objectContaining({
            source_place_id: '44444444-4444-4444-8444-000000000000',
            sort_order: 0,
          }),
        ],
        p_slug: 'seongsu-kape-cuceon-12345678123442349234123456789abc',
        p_title: '성수 카페 추천',
      },
    );
    const rpcPayload = supabaseClient.rpc.mock.calls[0]?.[1];
    expect(rpcPayload.p_places).toHaveLength(rpcPayload.p_place_count);
    expect(createdSharedMap).toEqual(sharedMapRow);
  });

  it('rejects empty place snapshots', async () => {
    await expect(
      createSharedMap('22222222-2222-4222-8222-222222222222', createPayload(0)),
    ).rejects.toThrow('shared_map_requires_places');
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('caps shared place snapshots at 100 places', async () => {
    const supabaseClient: SupabaseRpcClient = {
      rpc: vi.fn().mockResolvedValue({
        data: { ...sharedMapRow, place_count: 100, shared_map_places: [] },
        error: null,
      }),
    };
    mockCreateClient.mockReturnValue(supabaseClient);

    await createSharedMap(
      '22222222-2222-4222-8222-222222222222',
      createPayload(101),
    );

    expect(supabaseClient.rpc).toHaveBeenCalledWith(
      'create_shared_map_with_places',
      expect.objectContaining({
        p_place_count: 100,
        p_places: expect.arrayContaining([
          expect.objectContaining({
            source_place_id: '44444444-4444-4444-8444-000000000099',
          }),
        ]),
      }),
    );
    const rpcPayload = supabaseClient.rpc.mock.calls[0]?.[1];
    expect(rpcPayload.p_places).toHaveLength(rpcPayload.p_place_count);
    expect(supabaseClient.rpc).not.toHaveBeenCalledWith(
      'create_shared_map_with_places',
      expect.objectContaining({
        p_places: expect.arrayContaining([
          expect.objectContaining({
            source_place_id: '44444444-4444-4444-8444-000000000100',
          }),
        ]),
      }),
    );
  });

  it('regenerates the slug up to 3 times when slug insertion collides', async () => {
    const uniqueViolationError = { code: '23505', message: 'duplicate slug' };
    const supabaseClient: SupabaseRpcClient = {
      rpc: vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: uniqueViolationError })
        .mockResolvedValueOnce({
          data: {
            ...sharedMapRow,
            slug: 'seongsu-kape-cuceon-abcdef12123442349234123456789abc',
          },
          error: null,
        }),
    };
    mockCreateClient.mockReturnValue(supabaseClient);

    const createdSharedMap = await createSharedMap(
      '22222222-2222-4222-8222-222222222222',
      createPayload(),
    );

    expect(supabaseClient.rpc).toHaveBeenCalledTimes(2);
    expect(supabaseClient.rpc).toHaveBeenNthCalledWith(
      1,
      'create_shared_map_with_places',
      expect.objectContaining({
        p_slug: 'seongsu-kape-cuceon-12345678123442349234123456789abc',
      }),
    );
    expect(supabaseClient.rpc).toHaveBeenNthCalledWith(
      2,
      'create_shared_map_with_places',
      expect.objectContaining({
        p_slug: 'seongsu-kape-cuceon-abcdef12123442349234123456789abc',
      }),
    );
    expect(createdSharedMap.slug).toBe(
      'seongsu-kape-cuceon-abcdef12123442349234123456789abc',
    );
  });
});
