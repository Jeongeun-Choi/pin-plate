import Link from 'next/link';
import * as styles from '@/features/sign-in/components/LoginForm.styles.css';
import LoginForm from '@/features/sign-in/components/LoginForm';

const topIcon =
  'http://localhost:3845/assets/c0e8c76e07a0d08a2c51a6c409088264f692b1b8.svg';

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.topSection}>
          <div className={styles.topIconWrap}>
            <img src={topIcon} alt="pin" width={32} height={32} />
          </div>

          <h1 className={styles.title}>Pin plate</h1>
          <p className={styles.subtitle}>나만의 프라이빗 맛집 지도</p>
        </section>

        <LoginForm />

        <div style={{ width: '100%', marginTop: '16px' }}>
          <Link href="/sign-up" style={{ textDecoration: 'none' }}>
            <div className={styles.signupLink}>계정이 없으신가요? 회원가입</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
