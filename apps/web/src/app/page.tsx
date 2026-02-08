'use client';

import { useState } from 'react';
import { Map } from '@/features/map/components/Map';
import { HomeFAB } from './components/HomeFAB';
import { PostModal } from '@/features/post/components/PostModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Map />
      <HomeFAB onClick={() => setIsModalOpen(true)} />
      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
