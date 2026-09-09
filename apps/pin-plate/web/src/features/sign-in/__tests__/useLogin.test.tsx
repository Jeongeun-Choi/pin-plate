import { renderHook, waitFor } from '@testing-library/react';
import { useGoogleLogin, useLogin } from '../hooks/useLogin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as authApi from '../api/auth';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  getSession: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('useLogin', () => {
  let queryClient: QueryClient;
  const mockPush = vi.fn();

  beforeEach(() => {
    queryClient = createTestQueryClient();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to home page and save token on success', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      session: {
        access_token: 'test-token',
        user: { id: 'user-123' },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate({ email: 'test@test.com', password: 'password123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(localStorage.getItem('accessToken')).toBe('test-token');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should handle errors correctly', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useLogin(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate({ email: 'test@test.com', password: 'wrong' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Login failed');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects after Google login creates a session', async () => {
    vi.mocked(authApi.loginWithGoogle).mockResolvedValue({
      shouldVerifySession: true,
    });
    vi.mocked(authApi.getSession).mockResolvedValue({
      user: { id: 'google-user-123' },
    });

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.loginWithGoogle).toHaveBeenCalled();
    expect(authApi.getSession).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('surfaces a Google login error when the session cannot be confirmed', async () => {
    vi.mocked(authApi.loginWithGoogle).mockResolvedValue({
      shouldVerifySession: true,
    });
    vi.mocked(authApi.getSession).mockResolvedValue(null);

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(
      '로그인은 완료됐지만 세션을 확인하지 못했어요. 다시 시도해 주세요.',
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not verify the session while Google login is redirecting the current page', async () => {
    vi.mocked(authApi.loginWithGoogle).mockResolvedValue({
      shouldVerifySession: false,
    });

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.getSession).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
