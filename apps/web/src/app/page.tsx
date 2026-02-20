'use client';

import { useAtomValue } from 'jotai';
import { viewModeAtom } from '@/app/atoms';
import { Map } from '@/features/map/components/Map';
import { Navigation } from '@/components/Navigation';
import { GlobalPostModal } from '@/components/GlobalPostModal';
import { Header } from '@/components/Header';
import { PostList } from '@/features/post-list/components/PostList';

export default function Home() {
  const viewMode = useAtomValue(viewModeAtom);

  return (
    <main style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Header />
      {viewMode === 'map' ? (
        <Map />
      ) : (
        <div style={{ paddingTop: 80 }}>
          {' '}
          <PostList />{' '}
        </div>
      )}
      <Navigation />
      <GlobalPostModal />
    </main>
  );
}
