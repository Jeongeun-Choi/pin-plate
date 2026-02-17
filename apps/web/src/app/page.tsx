'use client';

import { Map } from '@/features/map/components/Map';

import { Navigation } from '@/components/Navigation';
import { GlobalPostModal } from '@/components/GlobalPostModal';

export default function Home() {
  return (
    <main style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Map />
      <Navigation />
      <GlobalPostModal />
    </main>
  );
}
