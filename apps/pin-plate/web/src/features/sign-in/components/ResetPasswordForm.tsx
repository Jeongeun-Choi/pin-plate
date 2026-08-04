'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Input } from '@pin-plate/ui';
import { z } from 'zod';
import * as styles from './LoginForm.styles.css';
import { usePasswordUpdate } from '../hooks/usePasswordReset';
import { getPasswordUpdateErrorMessage } from '../utils/validation';

interface ResetPasswordFieldErrors {
  password?: string;
  confirmPassword?: string;
}

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, '새 비밀번호를 입력해주세요.')
      .min(8, '비밀번호는 8자 이상이어야 해요.')
      .regex(/[A-Za-z]/, '비밀번호에 영문을 포함해주세요.')
      .regex(/[0-9]/, '비밀번호에 숫자를 포함해주세요.'),
    confirmPassword: z.string().min(1, '새 비밀번호를 한 번 더 입력해주세요.'),
  })
  .refine((fields) => fields.password === fields.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  });

const getResetPasswordValidationResult = (formData: FormData) => {
  const parsedFields = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsedFields.success) {
    const fieldErrors =
      parsedFields.error.issues.reduce<ResetPasswordFieldErrors>(
        (errors, issue) => {
          const fieldName = issue.path[0];

          if (
            (fieldName === 'password' || fieldName === 'confirmPassword') &&
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

const getDescribedBy = (...ids: Array<string | false | undefined>) => {
  const describedBy = ids.filter((id): id is string => Boolean(id)).join(' ');

  return describedBy || undefined;
};

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [hasUpdatedPassword, setHasUpdatedPassword] = useState(false);

  const { mutate: updateUserPassword, isPending: isPasswordUpdatePending } =
    usePasswordUpdate();

  const hasPasswordValue = password.length > 0;
  const hasConfirmPasswordValue = confirmPassword.length > 0;
  const isPasswordLongEnough = password.length >= 8;
  const hasPasswordLetter = /[A-Za-z]/.test(password);
  const hasPasswordNumber = /[0-9]/.test(password);
  const isPasswordMatched =
    hasConfirmPasswordValue && password === confirmPassword;
  const shouldShowPasswordMismatch =
    hasConfirmPasswordValue && password !== confirmPassword;
  const isFormDisabled = isPasswordUpdatePending || hasUpdatedPassword;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { fields, fieldErrors: validationFieldErrors } =
      getResetPasswordValidationResult(formData);

    if (!fields) {
      setFieldErrors(validationFieldErrors);
      setFormErrorMessage('');
      return;
    }

    setFieldErrors({});
    setFormErrorMessage('');
    updateUserPassword(
      { password: fields.password },
      {
        onSuccess: () => {
          setHasUpdatedPassword(true);
          setPassword('');
          setConfirmPassword('');
        },
        onError: (error) => {
          setHasUpdatedPassword(false);
          setFormErrorMessage(
            getPasswordUpdateErrorMessage(
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
        새 비밀번호를 정하면 다음 로그인부터 바로 사용할 수 있어요.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="new-password">
          새 비밀번호
        </label>
        <Input
          id="new-password"
          name="password"
          type="password"
          className={styles.emailInput}
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isFormDisabled}
          minLength={8}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={getDescribedBy(
            fieldErrors.password && 'new-password-error',
            'new-password-requirements',
          )}
          required
        />
        {fieldErrors.password && (
          <p
            id="new-password-error"
            className={styles.fieldErrorText}
            role="alert"
          >
            {fieldErrors.password}
          </p>
        )}
        <ul
          id="new-password-requirements"
          className={styles.passwordHelperList}
        >
          <li
            className={
              !hasPasswordValue || isPasswordLongEnough
                ? styles.passwordHelperItem
                : styles.passwordHelperItemInvalid
            }
          >
            8자 이상
          </li>
          <li
            className={
              !hasPasswordValue || hasPasswordLetter
                ? styles.passwordHelperItem
                : styles.passwordHelperItemInvalid
            }
          >
            영문 포함
          </li>
          <li
            className={
              !hasPasswordValue || hasPasswordNumber
                ? styles.passwordHelperItem
                : styles.passwordHelperItemInvalid
            }
          >
            숫자 포함
          </li>
        </ul>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirm-new-password">
          새 비밀번호 확인
        </label>
        <Input
          id="confirm-new-password"
          name="confirmPassword"
          type="password"
          className={styles.emailInput}
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isFormDisabled}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={getDescribedBy(
            fieldErrors.confirmPassword && 'confirm-new-password-error',
            hasConfirmPasswordValue && 'confirm-new-password-message',
          )}
          required
        />
        {fieldErrors.confirmPassword && (
          <p
            id="confirm-new-password-error"
            className={styles.fieldErrorText}
            role="alert"
          >
            {fieldErrors.confirmPassword}
          </p>
        )}
        {!fieldErrors.confirmPassword && hasConfirmPasswordValue && (
          <p
            id="confirm-new-password-message"
            className={
              isPasswordMatched
                ? styles.passwordHelperItem
                : styles.fieldErrorText
            }
            aria-live="polite"
          >
            {shouldShowPasswordMismatch
              ? '비밀번호가 일치하지 않습니다.'
              : '비밀번호가 일치합니다.'}
          </p>
        )}
      </div>

      {formErrorMessage && (
        <p className={styles.fieldErrorText} role="alert" aria-live="polite">
          {formErrorMessage}{' '}
          <Link className={styles.inlineTextLink} href="/forgot-password">
            새 링크 요청하기
          </Link>
        </p>
      )}

      {hasUpdatedPassword && (
        <section
          className={styles.statusMessage}
          role="status"
          aria-live="polite"
        >
          <p className={styles.statusTitle}>비밀번호가 바뀌었어요</p>
          <p className={styles.statusBody}>
            이제 새 비밀번호로 Pin Plate를 계속 사용할 수 있어요.
          </p>
        </section>
      )}

      <button
        type="submit"
        className={styles.loginButton}
        disabled={isFormDisabled}
      >
        {isPasswordUpdatePending ? '변경 중…' : '새 비밀번호 저장'}
      </button>

      <Link href="/sign-in" className={styles.signupLink}>
        로그인 화면으로 이동
      </Link>
    </form>
  );
}

export default ResetPasswordForm;
