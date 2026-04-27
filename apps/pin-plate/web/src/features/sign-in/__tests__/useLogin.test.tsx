import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from '../hooks/useLogin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter, AppRouterInstance } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as authApi from '../api/auth';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  getUserNickname: vi.fn(),
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
    } as unknown as AppRouterInstance);
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to home page and save token on success', async () => {
    vi.mocked(authApi.getUserNickname).mockResolvedValue('Test User');
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
});
