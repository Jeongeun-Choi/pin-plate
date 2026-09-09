'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { boundaryClassNames as styles } from './boundaryClassNames';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <main className={styles.container}>
          <section className={styles.card}>
            <div className={styles.iconContainer}>
              <span aria-hidden="true">!</span>
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
                className={styles.primaryButton}
                onClick={reset}
              >
                다시 시도하기
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
