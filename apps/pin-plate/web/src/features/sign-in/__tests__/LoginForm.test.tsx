import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../components/LoginForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as useLoginHook from '../hooks/useLogin';

vi.mock('../hooks/useLogin');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('LoginForm', () => {
  let queryClient: QueryClient;
  const mockLoginWithGoogle = vi.fn();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    (useLoginHook.useGoogleLogin as any).mockReturnValue({
      mutate: mockLoginWithGoogle,
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>,
    );

  it('Google 로그인 버튼을 렌더링한다', () => {
    renderComponent();
    expect(
      screen.getByRole('button', { name: /Google로 계속하기/ }),
    ).toBeInTheDocument();
  });

  it('서비스 약관 안내 텍스트를 표시한다', () => {
    renderComponent();
    expect(screen.getByText(/서비스 약관 및/)).toBeInTheDocument();
  });

  it('Google 버튼 클릭 시 loginWithGoogle을 호출한다', () => {
    (useLoginHook.useGoogleLogin as any).mockReturnValue({
      mutate: mockLoginWithGoogle,
    });

    renderComponent();
    const googleButton = screen.getByRole('button', {
      name: /Google로 계속하기/,
    });

    fireEvent.click(googleButton);

    expect(mockLoginWithGoogle).toHaveBeenCalled();
  });
});
