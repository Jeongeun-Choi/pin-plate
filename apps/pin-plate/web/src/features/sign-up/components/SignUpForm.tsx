'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@pin-plate/ui';
import { signup, type SignupState } from '../actions';
import * as styles from './SignUpForm.styles.css';
import { useToast } from '@/providers/ToastProvider';

const initialState: SignupState = {
  error: '',
};

const getDescribedBy = (...ids: Array<string | false | undefined>) => {
  const describedBy = ids.filter((id): id is string => Boolean(id)).join(' ');

  return describedBy || undefined;
};

export function SignUpForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [state, formAction, isPending] = useActionState(signup, initialState);
  const router = useRouter();
  const { showSuccessToast } = useToast();

  const hasPasswordValue = password.length > 0;
  const hasConfirmPasswordValue = confirmPassword.length > 0;
  const isPasswordLongEnough = password.length >= 8;
  const hasPasswordLetter = /[A-Za-z]/.test(password);
  const hasPasswordNumber = /[0-9]/.test(password);
  const isPasswordMatched =
    hasConfirmPasswordValue && password === confirmPassword;
  const shouldShowPasswordMismatch =
    hasConfirmPasswordValue && password !== confirmPassword;
  const nameError = state?.fieldErrors?.name;
  const emailError = state?.fieldErrors?.email;
  const passwordError = state?.fieldErrors?.password;
  const confirmPasswordError = state?.fieldErrors?.confirmPassword;

  useEffect(() => {
    if (state?.success) {
      showSuccessToast({
        title: state.requiresEmailConfirmation
          ? '인증 메일을 보냈어요'
          : '회원가입이 완료됐어요',
        description: state.message ?? '로그인 화면에서 바로 시작할 수 있어요.',
      });
      router.push('/sign-in');
    }
  }, [
    state?.message,
    state?.requiresEmailConfirmation,
    state?.success,
    router,
    showSuccessToast,
  ]);

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          이름
        </label>
        <Input
          id="name"
          name="name"
          className={styles.input}
          placeholder="이름"
          autoComplete="name"
          minLength={2}
          maxLength={20}
          disabled={isPending}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? 'name-error' : undefined}
          required
        />
        {nameError && (
          <p id="name-error" className={styles.fieldErrorMessage} role="alert">
            {nameError}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          이메일
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          className={styles.input}
          placeholder="example@email.com"
          autoComplete="email"
          disabled={isPending}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? 'email-error' : undefined}
          required
        />
        {emailError && (
          <p id="email-error" className={styles.fieldErrorMessage} role="alert">
            {emailError}
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
          className={styles.input}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          required
          minLength={8}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={getDescribedBy(
            passwordError && 'password-error',
            'password-requirements',
          )}
        />
        {passwordError && (
          <p
            id="password-error"
            className={styles.fieldErrorMessage}
            role="alert"
          >
            {passwordError}
          </p>
        )}
        <ul id="password-requirements" className={styles.helperList}>
          <li
            className={
              !hasPasswordValue || isPasswordLongEnough
                ? styles.helperItem
                : styles.helperItemInvalid
            }
          >
            8자 이상
          </li>
          <li
            className={
              !hasPasswordValue || hasPasswordLetter
                ? styles.helperItem
                : styles.helperItemInvalid
            }
          >
            영문 포함
          </li>
          <li
            className={
              !hasPasswordValue || hasPasswordNumber
                ? styles.helperItem
                : styles.helperItemInvalid
            }
          >
            숫자 포함
          </li>
        </ul>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPassword">
          비밀번호 확인
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          className={styles.input}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isPending}
          required
          minLength={8}
          aria-invalid={Boolean(confirmPasswordError)}
          aria-describedby={getDescribedBy(
            confirmPasswordError && 'confirm-password-error',
            hasConfirmPasswordValue && 'confirm-password-message',
          )}
        />
        {confirmPasswordError && (
          <p
            id="confirm-password-error"
            className={styles.fieldErrorMessage}
            role="alert"
          >
            {confirmPasswordError}
          </p>
        )}
        {!confirmPasswordError && hasConfirmPasswordValue && (
          <p
            id="confirm-password-message"
            className={
              isPasswordMatched ? styles.matchMessage : styles.errorMessage
            }
            aria-live="polite"
          >
            {shouldShowPasswordMismatch
              ? '비밀번호가 일치하지 않습니다.'
              : '비밀번호가 일치합니다.'}
          </p>
        )}
      </div>

      {state?.error && (
        <div className={styles.errorMessage} role="alert" aria-live="polite">
          {state.error}
        </div>
      )}

      <Button type="submit" size="full" disabled={isPending}>
        {isPending ? '회원가입 중...' : '회원가입'}
      </Button>

      <p className={styles.loginLink}>
        이미 계정이 있으신가요? <a href="/sign-in">로그인</a>
      </p>
    </form>
  );
}

export default SignUpForm;
