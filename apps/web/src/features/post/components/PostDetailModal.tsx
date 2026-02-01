'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@pin-plate/ui';
import { usePost } from '../hooks/usePost';
import * as styles from './styles/PostDetailModal.styles.css';

interface PostDetailModalProps {
  id: string;
}

export const PostDetailModal = ({ id }: PostDetailModalProps) => {
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(Number(id));

  const handleClose = () => {
    router.replace('/home');
  };

  const handleEdit = () => {
    // Navigate to edit or open edit modal
    // console.log('Edit post', id);
  };

  const handleDelete = () => {
    // Handle delete logic
    if (confirm('정말로 삭제하시겠습니까?')) {
      // call delete mutation
      // console.log('Delete post', id);
    }
  };

  if (isLoading) return null;
  if (error || !post) return null;

  const hasImages = post.image_urls && post.image_urls.length > 0;
  const displayImage = hasImages
    ? post.image_urls[0]
    : 'https://via.placeholder.com/600x400?text=No+Image';

  // Format date
  const formattedDate = new Date(post.created_at).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>리뷰 상세</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: 'none' }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.scrollArea}>
          {/* Image */}
          <div className={styles.imageContainer}>
            <Image
              src={displayImage}
              alt={post.place_name}
              fill
              className={styles.postImage}
              priority
            />
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Title & Rating */}
            <div className={styles.titleRow}>
              <h2 className={styles.title}>{post.place_name}</h2>
              <div className={styles.ratingBadge}>
                <span className={styles.starIcon}>★</span>
                <span>{Number(post.rating).toFixed(1)}</span>
              </div>
            </div>

            {/* Address */}
            <div className={styles.infoRow}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{post.address}</span>
            </div>

            {/* Description */}
            <div className={styles.descriptionBox}>{post.content}</div>

            {/* Date */}
            <div className={styles.infoRow}>
              {/* TODO: Icon으로 교체 */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.actionFooter}>
          <Button className={styles.editButton} onClick={handleEdit}>
            {/* TODO: Icon으로 교체 */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            수정
          </Button>
          <Button className={styles.deleteButton} onClick={handleDelete}>
            {/* TODO: Icon으로 교체 */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};
