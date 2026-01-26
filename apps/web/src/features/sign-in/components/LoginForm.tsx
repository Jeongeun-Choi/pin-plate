'use client';

import { useActionState } from 'react';
import { Input } from '@pin-plate/ui';
import { login } from '../actions';
import * as styles from './LoginForm.styles.css';

const initialState = {
  error: '',
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form className={styles.form} action={formAction}>
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
          disabled={isPending}
          required
        />
      </div>

      {state?.error && (
        <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
          {state.error}
        </div>
      )}

      <button className={styles.cta} type="submit" disabled={isPending}>
        {isPending ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}

export default LoginForm;
