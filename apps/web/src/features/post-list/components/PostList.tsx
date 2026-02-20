'use client';

import * as styles from './PostList.css';

export const PostList = () => {
  // Placeholder data
  const posts = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: `맛집 리스트 ${i + 1}`,
    description:
      '서울시 강남구 역삼동 맛집 추천합니다. 분위기도 좋고 맛도 좋아요!',
  }));

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {posts.map((post) => (
          <div key={post.id} className={styles.card}>
            <div className={styles.cardTitle}>{post.title}</div>
            <div className={styles.cardContent}>{post.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
