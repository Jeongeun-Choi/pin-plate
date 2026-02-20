'use client';

import * as styles from './PostList.css';
import { IcSort } from '@pin-plate/ui/icons';
import { Card } from '@pin-plate/ui';

export const PostList = () => {
  // Figma mockup data
  const posts = [
    {
      id: 1,
      title: '한우 소고기집 (0점)',
      rating: '0.0',
      location: '서울시 송파구 잠실동 890-12',
      description:
        '한우 1++등급이라고 하던데 정말 녹아요... 가격은 있지만 특별한 날 가기 좋습니다. 육회도 신선하고 맛있어요!',
      date: '2024년 2월 10일',
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76f60b52c30?q=80&w=600&auto=format&fit=crop', // Temporary placeholder
    },
    {
      id: 2,
      title: '브런치 카페 모닝 (1점)',
      rating: '1.0',
      location: '서울시 성동구 성수동 567-89',
      description:
        '성수동 핫플! 에그베네딕트가 진짜 맛있어요. 인스타 감성도 있고 커피도 훌륭합니다. 주말엔 웨이팅 필수!',
      date: '2024년 2월 5일',
      imageUrl:
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 3,
      title: '경복궁 손칼국수 (2점)',
      rating: '2.0',
      location: '서울시 종로구 북촌로 234-56',
      description:
        '경복궁 근처 갔다가 우연히 들렀는데 대박! 칼국수 면이 쫄깃하고 국물이 진해요. 만두 직접 빚으신대요.',
      date: '2024년 2월 1일',
      imageUrl:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 4,
      title: '이태리 파스타 하우스 (3점)',
      rating: '3.0',
      location: '서울시 마포구 연남동 789-12',
      description:
        '연남동 숨은 맛집! 알리오올리오가 정말 맛있어요. 면발도 쫄깃하고 마늘향이 진하게 나서 좋았습니다. 티라미수도 추천!',
      date: '2024년 1월 25일',
      imageUrl:
        'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 5,
      title: '스시 오마카세 텐 (4점)',
      rating: '4.0',
      location: '서울시 강남구 청담동 456-78',
      description:
        '가격은 좀 있지만 그만한 가치가 있어요. 셰프님이 직접 설명해주시면서 스시를 하나하나 내어주십니다. 특히 참치 뱃살이 최고였어요!',
      date: '2024년 1월 20일',
      imageUrl:
        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop', // Temporary placeholder
    },
    {
      id: 6,
      title: '제주 흑돼지 맛집 (5점)',
      rating: '5.0',
      location: '서울시 강남구 역삼동 123-45',
      description:
        '진짜 제주도에서 먹는 것처럼 맛있어요! 고기가 정말 부드럽고 육즙이 가득합니다. 된장찌개도 꼭 드세요.',
      date: '2024년 1월 15일',
      imageUrl:
        'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=600&auto=format&fit=crop', // Temporary placeholder
    },
  ];

  return (
    <div className={styles.container}>
      {/* Filter / Sort Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterHeader}>
          <div className={styles.sortIconWrapper}>
            <IcSort width={20} height={20} color="currentColor" />
          </div>
          <span className={styles.filterTitle}>정렬</span>
        </div>

        <div className={styles.filterButtonGroup}>
          <button
            className={`${styles.filterButton} ${styles.activeFilterButton}`}
          >
            최신순
          </button>
          <button className={styles.filterButton}>평점순</button>
          <button className={styles.filterButton}>거리순</button>
        </div>

        <div className={styles.reviewCount}>총 {posts.length}개의 리뷰</div>
      </div>

      {/* Main Grid */}
      <div className={styles.contentWrapper}>
        <div className={styles.grid}>
          {posts.map((post) => (
            <Card
              key={post.id}
              title={post.title}
              rating={post.rating}
              location={post.location}
              description={post.description}
              date={post.date}
              imageUrl={post.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
