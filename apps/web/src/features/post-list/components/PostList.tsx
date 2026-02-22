'use client';

import * as styles from './PostList.css';
import { Card, IcClock, IcNavigation, IcOutlinestar } from '@pin-plate/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getPosts } from '../../post/api/getPosts';
import { Post } from '../../post/types/post';

export const PostList = () => {
  // Fetch real data using TanStack Query
  const { data: posts } = useSuspenseQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  return (
    <div className={styles.container}>
      {/* Filter / Sort Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterButtonGroup}>
          <button
            className={`${styles.filterButton} ${styles.activeFilterButton}`}
          >
            <IcClock width={16} height={16} />
            <span>최신순</span>
          </button>
          <button className={styles.filterButton}>
            <IcOutlinestar width={16} height={16} />
            <span>별점순</span>
          </button>
          <button className={styles.filterButton}>
            <IcNavigation width={16} height={16} />
            <span>거리순</span>
          </button>
        </div>

        <div className={styles.reviewCount}>총 {posts.length}개의 리뷰</div>
      </div>

      {/* Main Grid */}
      <div className={styles.contentWrapper}>
        <div className={styles.grid}>
          {posts.map((post) => (
            <Card
              key={post.id}
              title={post.place_name || '이름 없음'}
              rating={Number(post.rating).toFixed(1) || '0.0'}
              location={post.address || '주소 정보 없음'}
              description={post.content}
              date={new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              imageUrl={
                post.image_urls?.[0] ||
                'https://images.unsplash.com/photo-1544025162-d76f60b52c30?q=80&w=600&auto=format&fit=crop'
              } // Fallback image setup
            />
          ))}
        </div>
      </div>
    </div>
  );
};
