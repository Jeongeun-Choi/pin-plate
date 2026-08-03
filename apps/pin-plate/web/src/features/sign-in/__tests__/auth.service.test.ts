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
  const originalBroadcastChannel = globalThis.BroadcastChannel;
  const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/auth';

  class MockBroadcastChannel extends EventTarget {
    static instances: MockBroadcastChannel[] = [];

    close = vi.fn();
    name: string;

    constructor(name: string) {
      super();
      this.name = name;
      MockBroadcastChannel.instances.push(this);
    }

    postMessage(message: unknown) {
      this.dispatchEvent(new MessageEvent('message', { data: message }));
    }

    emitMessage(message: unknown) {
      this.dispatchEvent(new MessageEvent('message', { data: message }));
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    MockBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
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
    vi.stubGlobal('BroadcastChannel', originalBroadcastChannel);
  });

  it('redirects the current page instead of opening a popup inside the mobile WebView', async () => {
    (window as { ReactNativeWebView?: unknown }).ReactNativeWebView = {
      postMessage: vi.fn(),
    };
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: googleOAuthUrl },
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
    expect(window.location.href).toBe(googleOAuthUrl);
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('falls back to current page redirect when the desktop popup is blocked', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: googleOAuthUrl },
      error: null,
    });

    vi.spyOn(window, 'open').mockReturnValue(null);

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
    expect(window.location.href).toBe(googleOAuthUrl);
  });

  it('opens a popup synchronously and exchanges the callback code in the opener', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: googleOAuthUrl },
      error: null,
    });
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });
    const mockPopupWindow = {
      close: vi.fn(),
      closed: false,
      location: { href: '' },
    } as unknown as Window;
    const mockOpen = vi.spyOn(window, 'open').mockReturnValue(mockPopupWindow);

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    });

    const loginPromise = loginWithGoogle();

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
    expect(mockPopupWindow.location.href).toBe(googleOAuthUrl);

    MockBroadcastChannel.instances[0]?.emitMessage({
      type: 'GOOGLE_LOGIN_CALLBACK',
      code: 'google-auth-code',
    });

    await expect(loginPromise).resolves.toBeUndefined();
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('google-auth-code');
    expect(mockPopupWindow.close).toHaveBeenCalled();
    expect(MockBroadcastChannel.instances[0]?.close).toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  it('exchanges the callback code when the callback sends a window message', async () => {
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: googleOAuthUrl },
      error: null,
    });
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });
    const mockPopupWindow = {
      close: vi.fn(),
      closed: false,
      location: { href: '' },
    } as unknown as Window;

    vi.spyOn(window, 'open').mockReturnValue(mockPopupWindow);

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    });

    const loginPromise = loginWithGoogle();

    await vi.waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'GOOGLE_LOGIN_CALLBACK', code: 'google-auth-code' },
        origin: window.location.origin,
      }),
    );

    await expect(loginPromise).resolves.toBeUndefined();
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('google-auth-code');
    expect(mockPopupWindow.close).toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });
});
