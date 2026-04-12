import Image from 'next/image';
import * as styles from '@/features/sign-up/components/SignUpForm.styles.css';
import SignUpForm from '@/features/sign-up/components/SignUpForm';

export default function SignUpPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.topSection}>
          <Image src="/logo.svg" alt="Pin-Plate" width={72} height={72} />

          <h1 className={styles.title}>Pin plate</h1>
          <p className={styles.subtitle}>나만의 프라이빗 맛집 지도</p>
        </section>

        <SignUpForm />
      </div>
    </div>
  );
}
