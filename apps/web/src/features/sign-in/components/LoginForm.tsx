'use client';

import { useState } from 'react';
import { Input } from '@pin-plate/ui';
import * as styles from './LoginForm.styles.css';
import { useLogin } from '../hooks/useLogin';
import { getAuthErrorMessage, isValidEmail } from '../utils/validation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { mutate: login, isPending, error: mutationError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setValidationError('이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setValidationError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (!trimmedPassword) {
      setValidationError('비밀번호를 입력해주세요.');
      return;
    }

    if (trimmedPassword.length < 8) {
      setValidationError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    login({ email: trimmedEmail, password: trimmedPassword });
  };

  const displayError =
    validationError || getAuthErrorMessage(mutationError as Error);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          이메일
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          className={styles.input as unknown as string}
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          비밀번호
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          className={styles.input as unknown as string}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (validationError) setValidationError(null);
          }}
          disabled={isPending}
          required
        />
      </div>

      {displayError && (
        <div
          style={{ color: '#FB2C36', fontSize: '14px', textAlign: 'center' }}
        >
          {displayError}
        </div>
      )}

      <button className={styles.cta} type="submit" disabled={isPending}>
        {isPending ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}

export default LoginForm;
