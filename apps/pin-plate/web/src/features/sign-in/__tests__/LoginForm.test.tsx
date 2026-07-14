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
  const mockLoginWithEmail = vi.fn();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockLoginWithEmail.mockReset();
    mockLoginWithGoogle.mockReset();

    vi.mocked(useLoginHook.useLogin).mockReturnValue({
      mutate: mockLoginWithEmail,
      isPending: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.mocked(useLoginHook.useGoogleLogin).mockReturnValue({
      mutate: mockLoginWithGoogle,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
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
    vi.mocked(useLoginHook.useGoogleLogin).mockReturnValue({
      mutate: mockLoginWithGoogle,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderComponent();
    const googleButton = screen.getByRole('button', {
      name: /Google로 계속하기/,
    });

    fireEvent.click(googleButton);

    expect(mockLoginWithGoogle).toHaveBeenCalled();
  });

  it('필수 입력 에러를 각 input 아래에 표시한다', () => {
    renderComponent();
    const form = screen.getByRole('button', { name: '로그인' }).closest('form');

    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    expect(mockLoginWithEmail).not.toHaveBeenCalled();
  });

  it('이메일 형식 에러를 이메일 input 아래에 표시한다', () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'wrong-email' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'password1' },
    });

    const form = screen.getByRole('button', { name: '로그인' }).closest('form');

    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(
      screen.getByText('유효한 이메일 형식을 입력해주세요.'),
    ).toBeInTheDocument();
    expect(mockLoginWithEmail).not.toHaveBeenCalled();
  });

  it('로그인 실패 메시지를 비밀번호 input 아래에 표시한다', () => {
    mockLoginWithEmail.mockImplementation(
      (_params: unknown, options?: { onError?: (error: Error) => void }) => {
        options?.onError?.(new Error('Invalid login credentials'));
      },
    );
    renderComponent();

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'wrongpassword' },
    });

    const form = screen.getByRole('button', { name: '로그인' }).closest('form');

    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(
      screen.getByText('이메일 또는 비밀번호가 일치하지 않습니다.'),
    ).toBeInTheDocument();
  });
});
