'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Input } from '@pin-plate/ui';
import { z } from 'zod';
import * as styles from './LoginForm.styles.css';
import { usePasswordResetRequest } from '../hooks/usePasswordReset';
import { getPasswordResetRequestErrorMessage } from '../utils/validation';

interface ForgotPasswordFieldErrors {
  email?: string;
}

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '재설정 메일을 받을 이메일을 입력해주세요.')
    .email('유효한 이메일 형식을 입력해주세요.'),
});

const getForgotPasswordValidationResult = (formData: FormData) => {
  const parsedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsedFields.success) {
    return {
      fields: null,
      fieldErrors: {
        email: parsedFields.error.issues[0]?.message,
      },
    };
  }

  return {
    fields: parsedFields.data,
    fieldErrors: null,
  };
};

export function ForgotPasswordForm() {
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [sentResetEmail, setSentResetEmail] = useState('');

  const {
    mutate: requestResetEmail,
    isPending: isPasswordResetRequestPending,
  } = usePasswordResetRequest();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { fields, fieldErrors: validationFieldErrors } =
      getForgotPasswordValidationResult(formData);

    if (!fields) {
      setFieldErrors(validationFieldErrors);
      setFormErrorMessage('');
      return;
    }

    setFieldErrors({});
    setFormErrorMessage('');
    requestResetEmail(
      { email: fields.email },
      {
        onSuccess: () => {
          setSentResetEmail(fields.email);
        },
        onError: (error) => {
          setSentResetEmail('');
          setFormErrorMessage(
            getPasswordResetRequestErrorMessage(
              error instanceof Error ? error : null,
            ),
          );
        },
      },
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.supportText}>
        가입한 이메일을 입력하면 비밀번호를 다시 설정할 수 있는 링크를
        보내드릴게요.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="reset-email">
          이메일
        </label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          className={styles.emailInput}
          placeholder="example@email.com"
          disabled={isPasswordResetRequestPending}
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
          required
        />
        {fieldErrors.email && (
          <p
            id="reset-email-error"
            className={styles.fieldErrorText}
            role="alert"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {formErrorMessage && (
        <p className={styles.fieldErrorText} role="alert" aria-live="polite">
          {formErrorMessage}
        </p>
      )}

      {sentResetEmail && (
        <section
          className={styles.statusMessage}
          role="status"
          aria-live="polite"
        >
          <p className={styles.statusTitle}>메일을 보냈어요</p>
          <p className={styles.statusBody}>
            {sentResetEmail} 메일함에서 Pin Plate 재설정 링크를 확인해주세요.
            계정이 없더라도 보안을 위해 같은 안내가 표시돼요.
          </p>
        </section>
      )}

      <button
        type="submit"
        className={styles.loginButton}
        disabled={isPasswordResetRequestPending}
      >
        {isPasswordResetRequestPending ? '메일 보내는 중…' : '재설정 메일 받기'}
      </button>

      <Link href="/sign-in" className={styles.signupLink}>
        로그인으로 돌아가기
      </Link>
    </form>
  );
}

export default ForgotPasswordForm;
