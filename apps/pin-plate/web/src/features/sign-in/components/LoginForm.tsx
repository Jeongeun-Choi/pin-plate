'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@pin-plate/ui';
import { z } from 'zod';
import * as styles from './LoginForm.styles.css';
import { useGoogleLogin, useLogin } from '../hooks/useLogin';
import { getAuthErrorMessage } from '../utils/validation';

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해주세요.')
    .email('유효한 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

const getLoginValidationResult = (formData: FormData) => {
  const parsedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsedFields.success) {
    const fieldErrors = parsedFields.error.issues.reduce<LoginFieldErrors>(
      (errors, issue) => {
        const fieldName = issue.path[0];

        if (
          (fieldName === 'email' || fieldName === 'password') &&
          !errors[fieldName]
        ) {
          errors[fieldName] = issue.message;
        }

        return errors;
      },
      {},
    );

    return {
      fields: null,
      fieldErrors,
    };
  }

  return {
    fields: parsedFields.data,
    fieldErrors: null,
  };
};

export function LoginForm() {
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const { mutate: loginWithEmail, isPending: isEmailLoginPending } = useLogin();
  const { mutate: loginWithGoogle } = useGoogleLogin();

  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { fields, fieldErrors: validationFieldErrors } =
      getLoginValidationResult(formData);

    if (!fields) {
      setFieldErrors(validationFieldErrors);
      return;
    }

    setFieldErrors({});
    loginWithEmail(
      { email: fields.email, password: fields.password },
      {
        onError: (error) => {
          const errorMessage = getAuthErrorMessage(
            error instanceof Error ? error : null,
          );

          if (errorMessage?.includes('이메일 인증')) {
            setFieldErrors({ email: errorMessage });
            return;
          }

          setFieldErrors({
            password:
              errorMessage ??
              '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
          });
        },
      },
    );
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className={styles.form}>
      <form onSubmit={handleEmailLogin}>
        <div className={styles.fieldsWrap}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              className={styles.emailInput}
              placeholder="example@email.com"
              disabled={isEmailLoginPending}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
            />
            {fieldErrors.email && (
              <p
                id="email-error"
                className={styles.fieldErrorText}
                role="alert"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              비밀번호
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              className={styles.emailInput}
              placeholder="••••••••"
              disabled={isEmailLoginPending}
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'password-error' : undefined
              }
              required
            />
            {fieldErrors.password && (
              <p
                id="password-error"
                className={styles.fieldErrorText}
                role="alert"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isEmailLoginPending}
        >
          {isEmailLoginPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className={styles.dividerWrap}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>또는</span>
        <div className={styles.dividerLine} />
      </div>

      <button
        type="button"
        className={styles.googleButton}
        onClick={handleGoogleLogin}
      >
        <Image
          src="/assets/ic-google.svg"
          alt="Google"
          width={24}
          height={24}
          className={styles.buttonIcon}
        />
        <span className={styles.buttonText}>Google로 계속하기</span>
      </button>

      <a href="/sign-up" className={styles.signupLink}>
        아직 계정이 없으신가요? 회원가입
      </a>

      <div className={styles.policyText}>
        로그인하면 Pin-Plate의 서비스 약관 및<br />
        개인정보 처리방침에 동의하게 됩니다.
      </div>
    </div>
  );
}

export default LoginForm;
