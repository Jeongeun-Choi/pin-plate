import { createClient } from '@/utils/supabase/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);

const {
  mockGetUser,
  mockFrom,
  mockPostInsert,
  mockPostInsertSelect,
  mockPlaceSelect,
  mockPlaceEqUserId,
  mockPlaceEqKakaoId,
  mockPlaceMaybeSingle,
  mockPlaceInsert,
  mockPlaceInsertSelect,
  mockPlaceInsertSingle,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockPostInsert: vi.fn(),
  mockPostInsertSelect: vi.fn(),
  mockPlaceSelect: vi.fn(),
  mockPlaceEqUserId: vi.fn(),
  mockPlaceEqKakaoId: vi.fn(),
  mockPlaceMaybeSingle: vi.fn(),
  mockPlaceInsert: vi.fn(),
  mockPlaceInsertSelect: vi.fn(),
  mockPlaceInsertSingle: vi.fn(),
}));

const TEST_IMAGE_ORIGIN = 'https://image.test';

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const createPostPayload = () => ({
  content: '맛있어요',
  rating: 5,
  image_urls: [],
  image_keys: ['uploads/users/user-1/photo.webp'],
  tags: [],
  place_name: '성수 카페',
  address: '서울 성동구',
  lat: 37.5,
  lng: 127,
  kakao_place_id: 'kakao-1',
  user_id: 'user-1',
});

describe('POST /api/posts place persistence', () => {
  beforeEach(() => {
    vi.stubEnv('IMAGE_PUBLIC_BASE_URL', TEST_IMAGE_ORIGIN);
    vi.stubEnv('GUEST_UPLOAD_SECRET', 'test-guest-secret');

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockPostInsertSelect.mockResolvedValue({ data: [{ id: 1 }], error: null });
    mockPostInsert.mockReturnValue({ select: mockPostInsertSelect });
    mockPlaceMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockPlaceEqKakaoId.mockReturnValue({ maybeSingle: mockPlaceMaybeSingle });
    mockPlaceEqUserId.mockReturnValue({ eq: mockPlaceEqKakaoId });
    mockPlaceSelect.mockReturnValue({ eq: mockPlaceEqUserId });
    mockPlaceInsertSingle.mockResolvedValue({
      data: { id: 'created-place-1', status: 'visited' },
      error: null,
    });
    mockPlaceInsertSelect.mockReturnValue({ single: mockPlaceInsertSingle });
    mockPlaceInsert.mockReturnValue({ select: mockPlaceInsertSelect });
    mockFrom.mockImplementation((table: string) =>
      table === 'places'
        ? { select: mockPlaceSelect, insert: mockPlaceInsert }
        : { insert: mockPostInsert },
    );
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as never);
  });

  it('creates a place and links the post when the post payload has no place id', async () => {
    const response = await POST(makeRequest(createPostPayload()) as never);

    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('places');
    expect(mockPlaceInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        kakao_place_id: 'kakao-1',
        place_name: '성수 카페',
        status: 'visited',
      }),
    );
    expect(mockPostInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        place_id: 'created-place-1',
      }),
    );
  });
});
