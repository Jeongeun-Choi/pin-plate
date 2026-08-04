import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import * as passwordResetHooks from '../hooks/usePasswordReset';

vi.mock('../hooks/usePasswordReset');

describe('ForgotPasswordForm', () => {
  const mockRequestResetEmail = vi.fn();

  beforeEach(() => {
    mockRequestResetEmail.mockReset();
    vi.mocked(passwordResetHooks.usePasswordResetRequest).mockReturnValue({
      mutate: mockRequestResetEmail,
      isPending: false,
    } as unknown as ReturnType<
      typeof passwordResetHooks.usePasswordResetRequest
    >);
  });

  it('이메일 형식 에러를 표시하고 메일 요청을 막는다', () => {
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'wrong-email' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: '재설정 메일 받기' })
        .closest('form') as HTMLFormElement,
    );

    expect(
      screen.getByText('유효한 이메일 형식을 입력해주세요.'),
    ).toBeInTheDocument();
    expect(mockRequestResetEmail).not.toHaveBeenCalled();
  });

  it('재설정 메일 요청 성공 상태를 표시한다', () => {
    mockRequestResetEmail.mockImplementation(
      (
        _params: unknown,
        options?: { onSuccess?: () => void; onError?: (error: Error) => void },
      ) => {
        options?.onSuccess?.();
      },
    );
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: '재설정 메일 받기' })
        .closest('form') as HTMLFormElement,
    );

    expect(mockRequestResetEmail).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(screen.getByText('메일을 보냈어요')).toBeInTheDocument();
    expect(screen.getByText(/user@example.com 메일함/)).toBeInTheDocument();
  });
});

describe('ResetPasswordForm', () => {
  const mockUpdateUserPassword = vi.fn();

  beforeEach(() => {
    mockUpdateUserPassword.mockReset();
    vi.mocked(passwordResetHooks.usePasswordUpdate).mockReturnValue({
      mutate: mockUpdateUserPassword,
      isPending: false,
    } as unknown as ReturnType<typeof passwordResetHooks.usePasswordUpdate>);
  });

  it('비밀번호 요구사항과 확인값 에러를 표시한다', () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText('새 비밀번호'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), {
      target: { value: 'different1' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: '새 비밀번호 저장' })
        .closest('form') as HTMLFormElement,
    );

    expect(
      screen.getByText('비밀번호는 8자 이상이어야 해요.'),
    ).toBeInTheDocument();
    expect(mockUpdateUserPassword).not.toHaveBeenCalled();
  });

  it('새 비밀번호 저장 성공 상태를 표시한다', () => {
    mockUpdateUserPassword.mockImplementation(
      (
        _params: unknown,
        options?: { onSuccess?: () => void; onError?: (error: Error) => void },
      ) => {
        options?.onSuccess?.();
      },
    );
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText('새 비밀번호'), {
      target: { value: 'newPassword1' },
    });
    fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), {
      target: { value: 'newPassword1' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: '새 비밀번호 저장' })
        .closest('form') as HTMLFormElement,
    );

    expect(mockUpdateUserPassword).toHaveBeenCalledWith(
      { password: 'newPassword1' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(screen.getByText('비밀번호가 바뀌었어요')).toBeInTheDocument();
  });
});
