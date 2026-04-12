'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import * as styles from './LoginForm.styles.css';
import { useGoogleLogin } from '../hooks/useLogin';
import { login } from '../actions';

const initialState = {
  error: '',
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const { mutate: loginWithGoogle } = useGoogleLogin();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className={styles.form}>
      <form action={formAction}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.emailInput}
            placeholder="example@email.com"
            disabled={isPending}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.emailInput}
            placeholder="••••••••"
            disabled={isPending}
            required
          />
        </div>

        {state?.error && <div className={styles.errorText}>{state.error}</div>}

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isPending}
        >
          {isPending ? '로그인 중...' : '로그인'}
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
