'use client';

import { useId } from 'react';
import { useRouter } from 'next/navigation';
import * as s from './GuestLocalPostsSection.css';
import { useGuestPosts } from '../hooks/useGuestPosts';

export const GuestLocalPostsSection = () => {
  const titleId = useId();
  const router = useRouter();

  const { guestPosts, guestPostCount } = useGuestPosts();

  const handleWriteClick = () => {
    router.push('/');
  };

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  return (
    <section className={s.container} aria-labelledby={titleId}>
      <div className={s.header}>
        <div>
          <h2 id={titleId} className={s.title}>
            이 기기에 저장된 기록
          </h2>
          <p className={s.description}>
            지금 브라우저에서 작성한 기록만 보여요.
          </p>
        </div>
        {guestPostCount > 0 && (
          <span className={s.countBadge}>{guestPostCount}개</span>
        )}
      </div>

      {guestPostCount === 0 ? (
        <div className={s.emptyState}>
          <p className={s.emptyText}>아직 이 기기에 저장된 기록이 없어요.</p>
          <button
            type="button"
            className={s.writeButton}
            onClick={handleWriteClick}
          >
            맛집 기록하러 가기
          </button>
        </div>
      ) : (
        <div className={s.previewList}>
          {guestPosts.slice(0, 3).map((post) => (
            <button
              key={post.id}
              type="button"
              className={s.previewItem}
              onClick={() => handlePostClick(post.id)}
            >
              <span className={s.placeName}>{post.place_name}</span>
              <span className={s.rating}>{post.rating.toFixed(1)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
