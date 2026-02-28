'use client';

import Image from 'next/image';
import * as styles from './LoginForm.styles.css';
import { useGoogleLogin } from '../hooks/useLogin';

export function LoginForm() {
  const { mutate: loginWithGoogle } = useGoogleLogin();

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleKakaoLogin = () => {
    alert('Kakao 로 로그인 준비중입니다.');
  };

  const handleAppleLogin = () => {
    alert('Apple 로 로그인 준비중입니다.');
  };

  return (
    <div className={styles.form}>
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

      <button
        type="button"
        className={styles.kakaoButton}
        onClick={handleKakaoLogin}
      >
        <Image
          src="/assets/ic-kakao.svg"
          alt="Kakao"
          width={24}
          height={24}
          className={styles.buttonIcon}
        />
        <span className={styles.buttonText}>Kakao로 계속하기</span>
      </button>

      <button
        type="button"
        className={styles.appleButton}
        onClick={handleAppleLogin}
      >
        <Image
          src="/assets/ic-apple.svg"
          alt="Apple"
          width={24}
          height={24}
          className={styles.buttonIcon}
        />
        <span className={styles.buttonText}>Apple로 계속하기</span>
      </button>

      <div className={styles.policyText}>
        로그인하면 Pin-Plate의 서비스 약관 및<br />
        개인정보 처리방침에 동의하게 됩니다.
      </div>
    </div>
  );
}

export default LoginForm;
