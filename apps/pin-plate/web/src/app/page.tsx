'use client';

import { useAtomValue } from 'jotai';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { viewModeAtom } from '@/app/atoms';
import { Navigation } from '@/components/Navigation';
import { GlobalPostModal } from '@/components/GlobalPostModal';
import { Header } from '@/components/Header';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Spinner } from '@pin-plate/ui';
import {
  fallbackContainer as fallbackContainerStyle,
  mainWrapper as mainWrapperStyle,
} from './page.css';
import { clickedMapInfoAtom } from '@/features/map/atoms';
import { isPostModalOpenAtom } from '@/features/post/atoms';

const PlaceDetailSheet = dynamic(
  () => import('@/features/map/components/PlaceDetailSheet'),
  {
    ssr: false,
  },
);

const Map = dynamic(
  () => import('@/features/map/components/Map').then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div className={fallbackContainerStyle}>
        <Spinner />
      </div>
    ),
  },
);

const PlaceList = dynamic(
  () => import('@/features/place-list/components/PlaceList'),
  { ssr: false },
);

export default function Home() {
  const viewMode = useAtomValue(viewModeAtom);
  const isPostModalOpen = useAtomValue(isPostModalOpenAtom);
  const clickedMapInfo = useAtomValue(clickedMapInfoAtom);

  return (
    <main className={mainWrapperStyle}>
      <Header />
      {/* <NearbySearchRoot /> */}
      <ErrorBoundary
        fallback={
          <div className={fallbackContainerStyle}>
            데이터를 불러오는데 실패했습니다.
          </div>
        }
      >
        <Suspense
          fallback={
            <div className={fallbackContainerStyle}>
              <Spinner />
            </div>
          }
        >
          {viewMode === 'map' ? <Map /> : <PlaceList />}
        </Suspense>
      </ErrorBoundary>
      {clickedMapInfo && <PlaceDetailSheet />}
      <Navigation />
      {isPostModalOpen && <GlobalPostModal />}
    </main>
  );
}
