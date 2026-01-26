import Link from 'next/link';
import * as styles from '../../features/sign-up/components/SignUpForm.styles.css';
import SignUpForm from '@/features/sign-up/components/SignUpForm';

const topIcon =
  'http://localhost:3845/assets/c0e8c76e07a0d08a2c51a6c409088264f692b1b8.svg';

export default function SignUpPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.topSection}>
          <div className={styles.topIconWrap}>
            <img src={topIcon} alt="pin" width={32} height={32} />
          </div>

          <h1 className={styles.title}>Pin-Plate</h1>
          <p className={styles.subtitle}>나만의 프라이빗 맛집 지도</p>
        </section>
        <SignUpForm />
        <div style={{ width: '100%' }}>
          <Link href="/sign-in" style={{ textDecoration: 'none' }}>
            <div className={styles.loginLink}>
              이미 계정이 있으신가요? 로그인
            </div>
          </Link>

          {/* TODO: SSO 도입시 부활시키기 */}
          {/* <div className={styles.dividerWrap}>
            <div className={styles.dividerLine} />
            <div
              style={{
                position: 'absolute',
                background: 'white',
                padding: '0 8px',
              }}
            >
              <span className={styles.dividerText}>또는</span>
            </div>
          </div>

          <button className={styles.googleBtn} style={{ marginTop: 12 }}>
            <img src={googleIcon} alt="google" width={20} height={20} />
            Google로 계속하기
          </button> */}

          <p className={styles.footerText} style={{ marginTop: '16px' }}>
            로그인하면 Pin-Plate의 서비스 약관 및
            <br /> 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
