import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  login,
  loginWithGoogle,
  requestPasswordReset,
  updatePassword,
} from '../api/auth';
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

  it('requests a password reset email with the reset callback URL', async () => {
    const mockResetPasswordForEmail = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'http://localhost:3000/sign-in',
        hostname: 'localhost',
        origin: 'http://localhost:3000',
      },
    });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    });

    await requestPasswordReset({ email: 'user@example.com' });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'http://localhost:3000/auth/callback?next=%2Freset-password',
    });
  });

  it('updates the authenticated recovery session password', async () => {
    const mockUpdateUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        updateUser: mockUpdateUser,
      },
    });

    await updatePassword({ password: 'newPassword1' });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: 'newPassword1',
    });
  });
});

describe('loginWithGoogle', () => {
  const originalLocation = window.location;
  const originalBroadcastChannel = globalThis.BroadcastChannel;
  const originalFetch = globalThis.fetch;
  const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/auth';
  const createJsonResponse = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
      ...init,
    });

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

  const createMockPopupWindow = (close = vi.fn()) => {
    const mockPopupWindow = {
      close,
      location: { href: '' },
    };

    Object.defineProperty(mockPopupWindow, 'closed', {
      get: () => {
        throw new Error('window.closed should not be read during OAuth.');
      },
    });

    return mockPopupWindow as unknown as Window;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    MockBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createJsonResponse({ url: googleOAuthUrl })),
    );
    delete (window as { ReactNativeWebView?: unknown }).ReactNativeWebView;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.stubGlobal('BroadcastChannel', originalBroadcastChannel);
    vi.stubGlobal('fetch', originalFetch);
  });

  it('redirects the current page instead of opening a popup inside the mobile WebView', async () => {
    (window as { ReactNativeWebView?: unknown }).ReactNativeWebView = {
      postMessage: vi.fn(),
    };
    const mockOpen = vi.spyOn(window, 'open').mockReturnValue(null);

    await loginWithGoogle();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8787/auth/sign-in/social',
      expect.objectContaining({
        body: expect.stringContaining('/auth/callback?provider=better-auth'),
      }),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.not.stringContaining('popup=true'),
      }),
    );
    expect(window.location.href).toBe(googleOAuthUrl);
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('falls back to current page redirect when the desktop popup is blocked', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);

    await loginWithGoogle();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8787/auth/sign-in/social',
      expect.objectContaining({
        body: expect.not.stringContaining('popup=true'),
      }),
    );
    expect(window.location.href).toBe(googleOAuthUrl);
  });

  it('uses the matching local Worker URL when the page runs on 127.0.0.1', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        hostname: '127.0.0.1',
        href: '',
        origin: 'http://127.0.0.1:3000',
      },
    });
    vi.spyOn(window, 'open').mockReturnValue(null);

    await loginWithGoogle();

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8787/auth/sign-in/social',
      expect.objectContaining({
        body: expect.stringContaining('http://127.0.0.1:3000/auth/callback'),
      }),
    );
    expect(window.location.href).toBe(googleOAuthUrl);
  });

  it('throws an actionable error when the Worker auth server is unreachable', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    vi.spyOn(window, 'open').mockReturnValue(null);

    await expect(loginWithGoogle()).rejects.toThrow(
      '인증 서버에 연결하지 못했습니다.',
    );
  });

  it('does not inspect cross-origin popup closed state while waiting for Google', async () => {
    vi.useFakeTimers();
    const mockPopupWindow = createMockPopupWindow();

    vi.spyOn(window, 'open').mockReturnValue(mockPopupWindow);

    const loginPromise = loginWithGoogle();

    await vi.waitFor(() => {
      expect(mockPopupWindow.location.href).toBe(googleOAuthUrl);
    });

    await vi.advanceTimersByTimeAsync(5 * 60 * 1_000);

    await expect(loginPromise).resolves.toBeUndefined();
    expect(mockPopupWindow.close).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('opens a popup synchronously and resolves when the Worker callback succeeds', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(createJsonResponse({ url: googleOAuthUrl }))
      .mockResolvedValueOnce(
        createJsonResponse({ user: { id: 'user-1', email: 'user@test.com' } }),
      );
    const mockPopupWindow = createMockPopupWindow();
    const mockOpen = vi.spyOn(window, 'open').mockReturnValue(mockPopupWindow);

    const loginPromise = loginWithGoogle();

    await vi.waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8787/auth/sign-in/social',
      expect.objectContaining({
        body: expect.stringContaining('popup=true'),
      }),
    );
    await vi.waitFor(() => {
      expect(mockPopupWindow.location.href).toBe(googleOAuthUrl);
    });

    MockBroadcastChannel.instances[0]?.emitMessage({
      type: 'GOOGLE_LOGIN_SUCCESS',
    });

    await expect(loginPromise).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8787/auth/get-session',
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(mockPopupWindow.close).toHaveBeenCalled();
    expect(MockBroadcastChannel.instances[0]?.close).toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  it('resolves when the callback sends a window success message', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(createJsonResponse({ url: googleOAuthUrl }))
      .mockResolvedValueOnce(
        createJsonResponse({ user: { id: 'user-1', email: 'user@test.com' } }),
      );
    const mockPopupClose = vi.fn(() => {
      throw new Error('COOP blocked close.');
    });
    const mockPopupWindow = createMockPopupWindow(mockPopupClose);

    vi.spyOn(window, 'open').mockReturnValue(mockPopupWindow);

    const loginPromise = loginWithGoogle();

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8787/auth/sign-in/social',
        expect.any(Object),
      );
      expect(mockPopupWindow.location.href).toBe(googleOAuthUrl);
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'GOOGLE_LOGIN_SUCCESS' },
        origin: window.location.origin,
      }),
    );

    await expect(loginPromise).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8787/auth/get-session',
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(mockPopupClose).toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });
});
