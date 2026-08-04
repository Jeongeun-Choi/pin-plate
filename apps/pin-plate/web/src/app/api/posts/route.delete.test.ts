import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE } from './route';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const mockCreateAdminClient = vi.mocked(createAdminClient);

const {
  mockGetUser,
  mockFrom,
  mockPostSelect,
  mockPostLookupEqId,
  mockPostLookupEqUserId,
  mockPostMaybeSingle,
  mockPostDelete,
  mockPostDeleteEqId,
  mockPostDeleteEqUserId,
  mockRemainingPostEqPlaceId,
  mockRemainingPostEqUserId,
  mockPlaceDelete,
  mockPlaceDeleteEqId,
  mockPlaceDeleteEqUserId,
  mockPlaceDeleteNeqStatus,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockPostSelect: vi.fn(),
  mockPostLookupEqId: vi.fn(),
  mockPostLookupEqUserId: vi.fn(),
  mockPostMaybeSingle: vi.fn(),
  mockPostDelete: vi.fn(),
  mockPostDeleteEqId: vi.fn(),
  mockPostDeleteEqUserId: vi.fn(),
  mockRemainingPostEqPlaceId: vi.fn(),
  mockRemainingPostEqUserId: vi.fn(),
  mockPlaceDelete: vi.fn(),
  mockPlaceDeleteEqId: vi.fn(),
  mockPlaceDeleteEqUserId: vi.fn(),
  mockPlaceDeleteNeqStatus: vi.fn(),
}));

const makeDeleteRequest = (id: string) =>
  new Request(`http://localhost/api/posts?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

const mockAuthenticatedUser = () => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-1' } },
    error: null,
  });
};

beforeEach(() => {
  mockAuthenticatedUser();

  mockPostSelect.mockImplementation((columns: string, options?: unknown) => {
    if (
      columns === 'id' &&
      typeof options === 'object' &&
      options !== null &&
      'head' in options
    ) {
      return { eq: mockRemainingPostEqPlaceId };
    }

    return { eq: mockPostLookupEqId };
  });
  mockPostLookupEqId.mockReturnValue({ eq: mockPostLookupEqUserId });
  mockPostLookupEqUserId.mockReturnValue({
    maybeSingle: mockPostMaybeSingle,
  });
  mockPostMaybeSingle.mockResolvedValue({
    data: { place_id: 'place-1' },
    error: null,
  });
  mockPostDeleteEqUserId.mockResolvedValue({ error: null });
  mockPostDeleteEqId.mockReturnValue({ eq: mockPostDeleteEqUserId });
  mockPostDelete.mockReturnValue({ eq: mockPostDeleteEqId });
  mockRemainingPostEqUserId.mockResolvedValue({ count: 0, error: null });
  mockRemainingPostEqPlaceId.mockReturnValue({ eq: mockRemainingPostEqUserId });
  mockPlaceDeleteNeqStatus.mockResolvedValue({ error: null });
  mockPlaceDeleteEqUserId.mockReturnValue({ neq: mockPlaceDeleteNeqStatus });
  mockPlaceDeleteEqId.mockReturnValue({ eq: mockPlaceDeleteEqUserId });
  mockPlaceDelete.mockReturnValue({ eq: mockPlaceDeleteEqId });
  mockFrom.mockImplementation((table: string) =>
    table === 'places'
      ? { delete: mockPlaceDelete }
      : { select: mockPostSelect, delete: mockPostDelete },
  );
  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser },
  } as never);
  mockCreateAdminClient.mockReturnValue({
    from: mockFrom,
  } as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('DELETE /api/posts', () => {
  it('deletes an empty non-wish place after deleting the last linked post', async () => {
    const response = await DELETE(makeDeleteRequest('1') as never);

    expect(response.status).toBe(200);
    expect(mockPostLookupEqId).toHaveBeenCalledWith('id', 1);
    expect(mockPostLookupEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockPostDeleteEqId).toHaveBeenCalledWith('id', 1);
    expect(mockPostDeleteEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockRemainingPostEqPlaceId).toHaveBeenCalledWith(
      'place_id',
      'place-1',
    );
    expect(mockRemainingPostEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockPlaceDeleteEqId).toHaveBeenCalledWith('id', 'place-1');
    expect(mockPlaceDeleteEqUserId).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockPlaceDeleteNeqStatus).toHaveBeenCalledWith('status', 'wish');
  });

  it('keeps the place when another linked post remains', async () => {
    mockRemainingPostEqUserId.mockResolvedValueOnce({
      count: 1,
      error: null,
    });

    const response = await DELETE(makeDeleteRequest('1') as never);

    expect(response.status).toBe(200);
    expect(mockPlaceDelete).not.toHaveBeenCalled();
  });

  it('skips place cleanup when the deleted post has no place id', async () => {
    mockPostMaybeSingle.mockResolvedValueOnce({
      data: { place_id: null },
      error: null,
    });

    const response = await DELETE(makeDeleteRequest('1') as never);

    expect(response.status).toBe(200);
    expect(mockRemainingPostEqPlaceId).not.toHaveBeenCalled();
    expect(mockPlaceDelete).not.toHaveBeenCalled();
  });
});
