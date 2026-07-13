import { createClient } from '@/utils/supabase/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH, POST } from './route';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);

const {
  mockGetUser,
  mockFrom,
  mockInsert,
  mockUpdate,
  mockInsertSelect,
  mockUpdateEqId,
  mockUpdateEqUserId,
  mockUpdateSelect,
  mockUpdateSingle,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockInsertSelect: vi.fn(),
  mockUpdateEqId: vi.fn(),
  mockUpdateEqUserId: vi.fn(),
  mockUpdateSelect: vi.fn(),
  mockUpdateSingle: vi.fn(),
}));

const TEST_IMAGE_ORIGIN = 'https://image.test';

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

const createPostPayload = (overrides?: Record<string, unknown>) => ({
  content: '맛있어요',
  rating: 5,
  image_urls: ['https://evil.test/ignored.webp'],
  image_keys: ['uploads/users/user-1/photo.webp'],
  tags: [],
  place_name: '성수 카페',
  address: '서울 성동구',
  lat: 37.5,
  lng: 127,
  kakao_place_id: 'kakao-1',
  user_id: 'user-1',
  place_id: 'place-1',
  ...overrides,
});

const mockAuthenticatedUser = (user: { id: string } | null) => {
  mockGetUser.mockResolvedValue({
    data: { user },
    error: null,
  });
};

beforeEach(() => {
  vi.stubEnv('IMAGE_PUBLIC_BASE_URL', TEST_IMAGE_ORIGIN);
  mockInsertSelect.mockResolvedValue({ data: [{ id: 1 }], error: null });
  mockInsert.mockReturnValue({ select: mockInsertSelect });
  mockUpdateSingle.mockResolvedValue({
    data: { id: 1, image_urls: [] },
    error: null,
  });
  mockUpdateSelect.mockReturnValue({ single: mockUpdateSingle });
  mockUpdateEqUserId.mockReturnValue({ select: mockUpdateSelect });
  mockUpdateEqId.mockReturnValue({ eq: mockUpdateEqUserId });
  mockUpdate.mockReturnValue({ eq: mockUpdateEqId });
  mockFrom.mockReturnValue({ insert: mockInsert, update: mockUpdate });
  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  } as never);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe('POST /api/posts', () => {
  it('creates a post from trusted user image keys and ignores submitted image URLs', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    const response = await POST(makeRequest(createPostPayload()) as never);

    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('posts');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        image_urls: [`${TEST_IMAGE_ORIGIN}/uploads/users/user-1/photo.webp`],
        user_id: 'user-1',
      }),
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.not.objectContaining({
        image_keys: expect.anything(),
      }),
    );
  });

  it('rejects URL-shaped image keys before inserting', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    const response = await POST(
      makeRequest(
        createPostPayload({
          image_keys: ['https://evil.test/photo.webp'],
        }),
      ) as never,
    );

    expect(response.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('rejects a payload for a different user', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    const response = await POST(
      makeRequest(createPostPayload({ user_id: 'user-2' })) as never,
    );

    expect(response.status).toBe(403);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/posts', () => {
  it('updates a post with sanitized image URLs only', async () => {
    mockAuthenticatedUser({ id: 'user-1' });

    const response = await PATCH(
      makeRequest({
        id: 1,
        payload: createPostPayload({
          image_keys: ['uploads/users/user-1/updated.webp'],
        }),
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        image_urls: [`${TEST_IMAGE_ORIGIN}/uploads/users/user-1/updated.webp`],
      }),
    );
    expect(mockUpdateEqId).toHaveBeenCalledWith('id', 1);
    expect(mockUpdateEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
