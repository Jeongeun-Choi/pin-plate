import Image from 'next/image';
import * as styles from '@/features/sign-in/components/LoginForm.styles.css';
import ForgotPasswordForm from '@/features/sign-in/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.topSection}>
          <Image src="/logo.svg" alt="Pin-Plate" width={72} height={72} />

          <h1 className={styles.title}>비밀번호 찾기</h1>
          <p className={styles.subtitle}>계정 이메일로 다시 시작하기</p>
        </section>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
