'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, startTransition } from 'react';
import * as styles from './error.styles.css';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 실무에서는 이곳에 Sentry 등의 에러 트래킹 서비스를 연결합니다.
    console.error('Unhandled Error:', error);
  }, [error]);

  const handleRetry = () => {
    // 모든 쿼리 무효화 후 Next.js 에러 상태 초기화
    queryClient.invalidateQueries();
    startTransition(() => {
      reset();
    });
  };

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.iconContainer}>
          <span>⚠️</span>
        </div>
        <h1 className={styles.title}>문제가 발생했습니다</h1>
        <p className={styles.description}>
          서비스 이용에 불편을 드려 죄송합니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => (window.location.href = '/')}
          >
            홈으로 가기
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleRetry}
          >
            다시 시도하기
          </button>
        </div>
      </section>
    </main>
  );
}
