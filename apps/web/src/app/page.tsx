'use client';

import { Map } from '@/features/map/components/Map';
import Link from 'next/link';
import { usePosts } from '@/features/post/hooks/usePosts';
import { Button } from '@pin-plate/ui';

export default function Home() {
  const { data: posts } = usePosts();

  return (
    <main
      style={{
        width: '100vw',
        height: '100dvh',
        position: 'relative',
      }}
    >
      <Map />

      {/* Overlay List for Testing Interception */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          background: 'white',
          padding: 20,
          borderRadius: 8,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h3>Test Posts (Click to Open Modal)</h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginTop: 10,
          }}
        >
          {posts?.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} passHref>
              <div
                style={{
                  padding: 10,
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                }}
              >
                {post.place_name}
              </div>
            </Link>
          ))}
          {!posts && <p>Loading posts...</p>}
        </div>
      </div>
    </main>
  );
}
