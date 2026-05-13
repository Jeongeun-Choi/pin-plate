'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import * as styles from './GuestSyncBanner.css';
import { useMyProfile } from '@/features/my-page';
import { useGuestPosts } from '../hooks/useGuestPosts';
import { useSyncGuestPosts } from '../hooks/useSyncGuestPosts';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import { clickedMapInfoAtom } from '@/features/map/atoms';

const DISMISSED_GUEST_POST_IDS_KEY = 'dismissed_guest_post_ids';

const loadDismissedGuestPostIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(DISMISSED_GUEST_POST_IDS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
};

const saveDismissedGuestPostIds = (ids: string[]): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(DISMISSED_GUEST_POST_IDS_KEY, JSON.stringify(ids));
};

export const GuestSyncBanner = () => {
  const [dismissedGuestPostIds, setDismissedGuestPostIds] = useState<string[]>(
    loadDismissedGuestPostIds,
  );
  const [syncResultMessage, setSyncResultMessage] = useState('');

  const isPostModalOpen = useAtomValue(isPostModalOpenAtom);
  const clickedMapInfo = useAtomValue(clickedMapInfoAtom);
  const { data: profile } = useMyProfile();
  const { guestPosts, guestPostCount } = useGuestPosts();
  const { syncGuestPosts, isSyncing } = useSyncGuestPosts();

  const isMapSheetOpen = !!clickedMapInfo;
  const hasUndismissedGuestPost = guestPosts.some(
    (post) => !dismissedGuestPostIds.includes(post.id),
  );
  const isVisible =
    !!profile && hasUndismissedGuestPost && !isPostModalOpen && !isMapSheetOpen;

  if (!isVisible) return null;

  const handleSync = async () => {
    setSyncResultMessage('');
    const result = await syncGuestPosts(profile.id);

    if (result.failedCount > 0) {
      setSyncResultMessage('일부 게시글을 저장하지 못했어요.');
      return;
    }

    setSyncResultMessage('계정에 저장됐습니다.');
  };

  const handleDismiss = () => {
    const currentGuestPostIds = guestPosts.map((post) => post.id);
    setDismissedGuestPostIds(currentGuestPostIds);
    saveDismissedGuestPostIds(currentGuestPostIds);
    setSyncResultMessage('');
  };

  const message =
    syncResultMessage ||
    (guestPostCount === 1
      ? '작성해둔 게시글을 계정에 저장할까요?'
      : `작성해둔 게시글 ${guestPostCount}개를 계정에 저장할까요?`);

  const syncButtonText = syncResultMessage
    ? '다시 시도'
    : isSyncing
      ? '저장 중...'
      : '계정에 저장';

  return (
    <div className={styles.banner} role="status">
      <span className={styles.message}>{message}</span>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.syncButton}
          onClick={handleSync}
          disabled={isSyncing}
        >
          {syncButtonText}
        </button>
        <button
          type="button"
          className={styles.dismissButton}
          onClick={handleDismiss}
        >
          나중에
        </button>
      </div>
    </div>
  );
};
