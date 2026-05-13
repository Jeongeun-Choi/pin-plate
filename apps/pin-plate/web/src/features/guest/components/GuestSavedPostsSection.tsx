'use client';

import { useState } from 'react';
import * as styles from './GuestSavedPostsSection.css';
import { useGuestPosts } from '../hooks/useGuestPosts';
import { useSyncGuestPosts } from '../hooks/useSyncGuestPosts';

interface Props {
  userId: string;
}

export const GuestSavedPostsSection = ({ userId }: Props) => {
  const [resultMessage, setResultMessage] = useState('');

  const { guestPosts, guestPostCount, clearGuestPosts } = useGuestPosts();
  const { syncGuestPosts, isSyncing } = useSyncGuestPosts();

  if (guestPostCount === 0) return null;

  const handleSync = async () => {
    setResultMessage('');
    const result = await syncGuestPosts(userId);

    if (result.failedCount > 0) {
      setResultMessage('일부 게시글을 저장하지 못했어요. 다시 시도해 주세요.');
      return;
    }

    setResultMessage('작성해둔 글을 계정에 저장했어요.');
  };

  const handleDelete = () => {
    const shouldDelete = window.confirm(
      '작성해둔 글을 삭제할까요? 삭제하면 되돌릴 수 없습니다.',
    );

    if (!shouldDelete) return;

    clearGuestPosts();
    setResultMessage('');
  };

  return (
    <section className={styles.container} aria-labelledby="guest-posts-title">
      <div className={styles.header}>
        <div>
          <h2 id="guest-posts-title" className={styles.title}>
            작성해둔 글
          </h2>
          <p className={styles.description}>
            아직 계정에 저장되지 않은 글이에요.
          </p>
        </div>
        <span className={styles.countBadge}>{guestPostCount}개</span>
      </div>

      <div className={styles.previewList}>
        {guestPosts.slice(0, 3).map((post) => (
          <div key={post.id} className={styles.previewItem}>
            <span className={styles.placeName}>{post.place_name}</span>
            <span className={styles.rating}>{post.rating.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {resultMessage && <p className={styles.resultText}>{resultMessage}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.syncButton}
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? '저장 중...' : '계정에 저장'}
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isSyncing}
        >
          삭제
        </button>
      </div>
    </section>
  );
};
