import Image from 'next/image';
import * as styles from './styles/PostDetailModal.styles.css';
import { Post } from '../types/post';

interface IPostDetailContentProps {
  post: Post;
}

export default function PostDetailContent({ post }: IPostDetailContentProps) {
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
    <>
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
    </>
  );
}
