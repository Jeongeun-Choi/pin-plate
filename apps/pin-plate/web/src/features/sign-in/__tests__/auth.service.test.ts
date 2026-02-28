import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../services/auth.service';
import { createClient } from '@/utils/supabase/client';

// 모듈 전체를 Mocking하되, createClient를 vi.fn()으로 정의하여
// 테스트 내부에서 반환값을 조작(.mockReturnValue)할 수 있게 합니다.
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return data when login is successful', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { session: { access_token: 'fake-token' } },
      error: null,
    });

    // createClient가 호출되면 우리가 만든 mockSignIn을 포함한 객체를 반환하도록 설정
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
      },
    });

    const result = await login({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(createClient).toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result).toEqual({ session: { access_token: 'fake-token' } });
  });

  it('should throw an error when login fails', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
      },
    });

    await expect(
      login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
  });
});
