'use client';

import { Popover } from '@pin-plate/ui';
import { Post } from '../types/post';
import PostDetailContent from './PostDetailContent';
import * as styles from './styles/PostDetailModal.styles.css';

interface ReviewCardProps {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  sectionRef: (node: HTMLElement | null) => void;
}

export const ReviewCard = ({
  post,
  onEdit,
  onDelete,
  sectionRef,
}: ReviewCardProps) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <section
      ref={sectionRef}
      data-post-id={post.id}
      className={styles.reviewPanel}
    >
      <div className={styles.reviewPanelInner}>
        <PostDetailContent
          post={post}
          metaSlot={
            <>
              <span className={styles.reviewCardDate}>{formattedDate}</span>
              <div className={styles.reviewMetaActions}>
                <Popover>
                  <Popover.Trigger>⋮</Popover.Trigger>
                  <Popover.Menu>
                    <Popover.Item onClick={onEdit}>수정하기</Popover.Item>
                    <Popover.Item onClick={onDelete}>삭제하기</Popover.Item>
                  </Popover.Menu>
                </Popover>
              </div>
            </>
          }
        />
      </div>
    </section>
  );
};

ReviewCard.displayName = 'ReviewCard';
