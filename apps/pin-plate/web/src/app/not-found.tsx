'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as styles from './not-found.styles.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.iconContainer}>
          <Image
            src="/logo.svg"
            alt="Pinplate 로고"
            width={80}
            height={80}
            priority
          />
        </div>
        <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.description}>
          요청하신 페이지가 삭제되었거나,
          <br />
          잘못된 경로로 접근하셨을 수 있습니다.
        </p>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => router.push('/')}
          >
            홈으로 가기
          </button>
        </div>
      </section>
    </main>
  );
}
