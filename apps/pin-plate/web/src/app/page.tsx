'use client';

import { useAtomValue } from 'jotai';
import { viewModeAtom } from '@/app/atoms';
import { Map } from '@/features/map/components/Map';
import { Navigation } from '@/components/Navigation';
import { GlobalPostModal } from '@/components/GlobalPostModal';
import { Header } from '@/components/Header';
import { PostList } from '@/features/post-list/components/PostList';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Suspense } from 'react';
import * as styles from './page.css';

export default function Home() {
  const viewMode = useAtomValue(viewModeAtom);

  return (
    <main className={styles.mainWrapper}>
      <Header />
      {viewMode === 'map' ? (
        <Map />
      ) : (
        <ErrorBoundary
          fallback={
            <div className={styles.fallbackContainer}>
              데이터를 불러오는데 실패했습니다.
            </div>
          }
        >
          <Suspense
            fallback={
              <div className={styles.fallbackContainer}>로딩 중...</div>
            }
          >
            <PostList />
          </Suspense>
        </ErrorBoundary>
      )}
      <Navigation />
      <GlobalPostModal />
    </main>
  );
}
