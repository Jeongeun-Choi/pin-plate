import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { login, loginWithGoogle } from '../api/auth';
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

describe('loginWithGoogle', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as { ReactNativeWebView?: unknown }).ReactNativeWebView;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('redirects the current page instead of opening a popup inside the mobile WebView', async () => {
    (window as { ReactNativeWebView?: unknown }).ReactNativeWebView = {
      postMessage: vi.fn(),
    };
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth' },
      error: null,
    });
    const mockOpen = vi.spyOn(window, 'open').mockReturnValue(null);

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: { signInWithOAuth: mockSignInWithOAuth },
    });

    await loginWithGoogle();

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          redirectTo: expect.not.stringContaining('popup=true'),
        }),
      }),
    );
    expect(window.location.href).toBe(
      'https://accounts.google.com/o/oauth2/auth',
    );
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('opens a popup and waits on BroadcastChannel outside the mobile WebView', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/auth' },
      error: null,
    });
    const mockOpen = vi.spyOn(window, 'open').mockReturnValue(null);

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: { signInWithOAuth: mockSignInWithOAuth },
    });

    void loginWithGoogle();
    await vi.waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('popup=true'),
        }),
      }),
    );
    expect(window.location.href).toBe('');
  });
});
