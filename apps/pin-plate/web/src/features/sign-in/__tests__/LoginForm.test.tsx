import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../components/LoginForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as useLoginHook from '../hooks/useLogin';

// Mock styles (if needed, but vanilla-extract might handle it via plugin)
// If classNames are obfuscated, we might need to rely on roles/labels.

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
  const mockLogin = vi.fn();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    (useLoginHook.useLogin as any).mockReturnValue({
      mutate: mockLogin,
      isPending: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>,
    );

  it('renders login form correctly', () => {
    renderComponent();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.click(submitButton);

    expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', () => {
    renderComponent();
    const emailInput = screen.getByLabelText('이메일');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText('올바른 이메일 형식이 아닙니다.'),
    ).toBeInTheDocument();
  });

  it('shows validation error for short password', () => {
    renderComponent();
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText('비밀번호는 최소 8자 이상이어야 합니다.'),
    ).toBeInTheDocument();
  });

  it('calls login mutation when form is valid', () => {
    renderComponent();
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('displays server error message', () => {
    (useLoginHook.useLogin as any).mockReturnValue({
      mutate: mockLogin,
      isPending: false,
      error: new Error('Invalid login credentials'),
    });

    renderComponent();

    // The component uses getAuthErrorMessage to translate
    expect(
      screen.getByText('이메일 또는 비밀번호가 일치하지 않습니다.'),
    ).toBeInTheDocument();
  });
});
