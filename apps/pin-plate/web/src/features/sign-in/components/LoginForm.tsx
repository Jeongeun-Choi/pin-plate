'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as styles from './LoginForm.styles.css';
import { useGoogleLogin, useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const [loginError, setLoginError] = useState('');

  const { mutate: loginWithEmail, isPending: isEmailLoginPending } = useLogin();
  const { mutate: loginWithGoogle } = useGoogleLogin();

  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setLoginError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoginError('');
    loginWithEmail(
      { email, password },
      {
        onError: () =>
          setLoginError(
            '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
          ),
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
            <input
              id="email"
              name="email"
              type="email"
              className={styles.emailInput}
              placeholder="example@email.com"
              disabled={isEmailLoginPending}
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
              disabled={isEmailLoginPending}
              required
            />
          </div>
        </div>

        {loginError && <div className={styles.errorText}>{loginError}</div>}

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
