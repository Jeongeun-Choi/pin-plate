'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, startTransition } from 'react';
import * as styles from './error.styles.css';

interface PostErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PostError({ error, reset }: PostErrorProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.error('Post Detail Error:', error);
  }, [error]);

  const handleRetry = () => {
    // 포스트 관련 쿼리 무효화 후 Next.js 에러 상태 초기화
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    startTransition(() => {
      reset();
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>포스트를 불러올 수 없습니다</h2>
      <p className={styles.message}>
        네트워크 연결 상태를 확인하거나
        <br />
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        className={styles.retryButton}
        onClick={handleRetry}
      >
        다시 시도하기
      </button>
    </div>
  );
}
