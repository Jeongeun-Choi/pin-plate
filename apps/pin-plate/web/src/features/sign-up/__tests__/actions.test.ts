import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signup, type SignupState } from '../actions';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const {
  mockSignUp,
  mockSignOut,
  mockUpsert,
  mockFrom,
  mockCreateClient,
  mockCreateAdminClient,
} = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockUpsert: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateClient: vi.fn(),
  mockCreateAdminClient: vi.fn(),
}));

const initialState: SignupState = {
  error: '',
};

const makeSignupFormData = (overrides?: Record<string, string>) => {
  const formData = new FormData();
  const fields = {
    name: '맛집러',
    email: 'USER@EXAMPLE.COM',
    password: 'password1',
    confirmPassword: 'password1',
    ...overrides,
  };

  Object.entries(fields).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
};

beforeEach(() => {
  vi.clearAllMocks();

  mockSignUp.mockResolvedValue({
    data: {
      user: { id: 'user-1' },
      session: { access_token: 'token' },
    },
    error: null,
  });
  mockSignOut.mockResolvedValue({ error: null });
  mockUpsert.mockResolvedValue({ error: null });
  mockFrom.mockReturnValue({ upsert: mockUpsert });
  mockCreateClient.mockResolvedValue({
    auth: {
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  });
  mockCreateAdminClient.mockReturnValue({
    from: mockFrom,
  });

  vi.mocked(createClient).mockImplementation(mockCreateClient);
  vi.mocked(createAdminClient).mockImplementation(mockCreateAdminClient);
});

describe('signup', () => {
  it('creates a profile, signs out, and returns success when Supabase creates a session', async () => {
    const result = await signup(initialState, makeSignupFormData());

    expect(result).toEqual({
      error: '',
      success: true,
      message: '로그인 화면에서 바로 시작할 수 있어요.',
    });
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password1',
      options: {
        data: {
          full_name: '맛집러',
        },
      },
    });
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpsert).toHaveBeenCalledWith({
      id: 'user-1',
      nickname: '맛집러',
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('returns an email confirmation success state when signup succeeds without a session', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'user-1' },
        session: null,
      },
      error: null,
    });

    const result = await signup(initialState, makeSignupFormData());

    expect(result).toEqual({
      error: '',
      success: true,
      requiresEmailConfirmation: true,
      message:
        '인증 메일을 보냈어요. 메일함에서 인증을 완료한 뒤 로그인해주세요.',
    });
    expect(mockUpsert).toHaveBeenCalledWith({
      id: 'user-1',
      nickname: '맛집러',
    });
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('rejects invalid form input before calling Supabase', async () => {
    const result = await signup(
      initialState,
      makeSignupFormData({ email: 'not-an-email' }),
    );

    expect(result).toEqual({
      error: '',
      fieldErrors: {
        email: '유효한 이메일 형식을 입력해주세요.',
      },
    });
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords before calling Supabase', async () => {
    const result = await signup(
      initialState,
      makeSignupFormData({ confirmPassword: 'password2' }),
    );

    expect(result).toEqual({
      error: '',
      fieldErrors: {
        confirmPassword: '비밀번호가 일치하지 않습니다.',
      },
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('translates duplicate email errors', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    const result = await signup(initialState, makeSignupFormData());

    expect(result).toEqual({
      error: '',
      fieldErrors: {
        email: '이미 가입된 이메일입니다.',
      },
    });
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('returns a profile creation error when profile upsert fails', async () => {
    mockUpsert.mockResolvedValue({
      error: { message: 'insert failed' },
    });

    const result = await signup(initialState, makeSignupFormData());

    expect(result).toEqual({
      error: '프로필 생성에 실패했습니다. 다시 시도해주세요.',
    });
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
