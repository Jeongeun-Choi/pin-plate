'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as styles from './not-found.styles.css';

export default function NotFound() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // 브라우저 히스토리가 1보다 크면 이전 페이지가 있다고 판단
    if (typeof window !== 'undefined' && window.history.length > 1) {
      setHasHistory(true);
    }
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.iconContainer}>
          <span>🕵️</span>
        </div>
        <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.description}>
          요청하신 페이지가 삭제되었거나,
          <br />
          잘못된 경로로 접근하셨을 수 있습니다.
        </p>
        <div className={styles.buttonGroup}>
          {hasHistory && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => router.back()}
            >
              이전 페이지로
            </button>
          )}
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
