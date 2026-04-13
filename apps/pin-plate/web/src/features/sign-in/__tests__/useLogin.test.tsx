import { renderHook, waitFor } from '@testing-library/react';
import { useLogin } from '../hooks/useLogin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as authService from '../services/auth.service';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock auth service
vi.mock('../services/auth.service', () => ({
  login: vi.fn(),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to home page and save token on success', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      session: { access_token: 'test-token' },
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
    vi.mocked(authService.login).mockRejectedValue(new Error('Login failed'));

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
