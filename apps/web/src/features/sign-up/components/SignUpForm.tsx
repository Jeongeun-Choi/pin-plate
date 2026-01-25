'use client';

import { useActionState } from 'react';
import { Input } from '@pin-plate/ui';
import { signup } from '../actions';
import * as styles from './SignUpForm.styles.css';

const signupIcon =
  'http://localhost:3845/assets/fa4a3321d9658b6667b8a4fe466a85f9de569dd1.svg';

const initialState = {
  error: '',
};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

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
          disabled={isPending}
          required
        />
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
          className={styles.input}
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          required
          minLength={6}
        />
      </div>

      {state?.error && (
        <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
          {state.error}
        </div>
      )}

      <button className={styles.cta} type="submit" disabled={isPending}>
        {isPending ? (
          '가입 중...'
        ) : (
          <>
            <img src={signupIcon} alt="signup" width={20} height={20} />
            회원가입
          </>
        )}
      </button>
    </form>
  );
}

export default SignUpForm;
