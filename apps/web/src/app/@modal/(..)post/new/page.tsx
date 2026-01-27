'use client';

import React, { useRouter } from 'next/navigation';
import PostForm from '@/features/post/components/PostForm';
import * as styles from './modal.css';

export default function InterceptedNewPostPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>
        <PostForm />
      </div>
    </div>
  );
}
