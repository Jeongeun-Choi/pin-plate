'use client';

export const dynamic = 'force-dynamic';

import { useAtomValue } from 'jotai';
import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';
import { viewModeAtom } from '@/app/atoms';
import { Navigation } from '@/components/Navigation';
import { GlobalPostModal } from '@/components/GlobalPostModal';
import { Header } from '@/components/Header';
import { PlaceList } from '@/features/place-list/components/PlaceList';
import { PlaceDetailSheet } from '@/features/map/components/PlaceDetailSheet';
// import { NearbySearchRoot } from '@/features/nearby-search/components/NearbySearchRoot';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Spinner } from '@pin-plate/ui';
import * as styles from './page.css';

const Map = nextDynamic(
  () => import('@/features/map/components/Map').then((m) => m.Map),
  { ssr: false },
);

export default function Home() {
  const viewMode = useAtomValue(viewModeAtom);

  return (
    <main className={styles.mainWrapper}>
      <Header />
      {/* <NearbySearchRoot /> */}
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
              <div className={styles.fallbackContainer}>
                <Spinner />
              </div>
            }
          >
            <PlaceList />
          </Suspense>
        </ErrorBoundary>
      )}
      <PlaceDetailSheet />
      <Navigation />
      <GlobalPostModal />
    </main>
  );
}
