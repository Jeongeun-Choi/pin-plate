'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as styles from './GuestSavedPostsSection.css';
import { useRawLocalPosts } from '@/features/local-db/hooks/useLocalPosts';
import { localPostRepository } from '@/features/local-db/repositories/localPostRepository';
import { localDbKeys } from '@/features/local-db/localDbKeys';
import { useSyncGuestPosts } from '../hooks/useSyncGuestPosts';

interface Props {
  userId: string;
}

export const GuestSavedPostsSection = ({ userId }: Props) => {
  const [resultMessage, setResultMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();
  const { data: localPosts = [] } = useRawLocalPosts();
  const { syncGuestPosts, isSyncing } = useSyncGuestPosts();

  const localPostCount = localPosts.length;

  if (localPostCount === 0) return null;

  const handleSync = async () => {
    setResultMessage('');
    const result = await syncGuestPosts(userId);

    if (result.failedCount > 0) {
      setResultMessage('일부 게시글을 저장하지 못했어요. 다시 시도해 주세요.');
      return;
    }

    setResultMessage('작성해둔 글을 계정에 저장했어요.');
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      '작성해둔 글을 삭제할까요? 삭제하면 되돌릴 수 없습니다.',
    );

    if (!shouldDelete) return;

    setIsDeleting(true);
    try {
      await localPostRepository.clearAllLocalData();
      await queryClient.invalidateQueries({ queryKey: localDbKeys.all });
      setResultMessage('');
    } finally {
      setIsDeleting(false);
    }
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
        <span className={styles.countBadge}>{localPostCount}개</span>
      </div>

      <div className={styles.previewList}>
        {localPosts.slice(0, 3).map((post) => (
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
          disabled={isSyncing || isDeleting}
        >
          {isSyncing ? '저장 중...' : '계정에 저장'}
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isSyncing || isDeleting}
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </section>
  );
};
