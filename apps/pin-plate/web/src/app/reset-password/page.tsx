import Image from 'next/image';
import * as styles from '@/features/sign-in/components/LoginForm.styles.css';
import ResetPasswordForm from '@/features/sign-in/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <section className={styles.topSection}>
          <Image src="/logo.svg" alt="Pin-Plate" width={72} height={72} />

          <h1 className={styles.title}>새 비밀번호 설정</h1>
          <p className={styles.subtitle}>메일 링크 확인이 끝났어요</p>
        </section>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
