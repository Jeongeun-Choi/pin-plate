import Image from 'next/image';
import * as styles from '@/features/sign-in/components/LoginForm.styles.css';
import LoginForm from '@/features/sign-in/components/LoginForm';

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.topSection}>
          <Image src="/logo.svg" alt="Pin-Plate" width={72} height={72} />

          <h1 className={styles.title}>Pin plate</h1>
          <p className={styles.subtitle}>나만의 프라이빗 맛집 지도</p>
        </section>

        <LoginForm />
      </div>
    </div>
  );
}
