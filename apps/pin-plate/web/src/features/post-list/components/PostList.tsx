'use client';

import * as styles from './PostList.css';
import { useMemo, useState } from 'react';
import { getImageProps } from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { Card, IcClock, IcNavigation, IcOutlinestar } from '@pin-plate/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getPosts } from '../../post/api/getPosts';
import { Post } from '../../post/types/post';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { postKeys } from '../../post/postKeys';
import { createClient } from '@/utils/supabase/client';
import { searchQueryAtom } from '@/app/atoms';

type SortType = 'latest' | 'rating' | 'distance';

const getCardImageProps = (imageUrl: string) => {
  const { props } = getImageProps({
    src: imageUrl,
    alt: '',
    width: 400,
    height: 192,
    sizes: '(min-width: 640px) 400px, 100vw',
  });
  return { srcSet: props.srcSet, sizes: props.sizes };
};

// Haversine formula to calculate distance
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

export const PostList = () => {
  const [sortBy, setSortBy] = useState<SortType>('latest');

  const searchQuery = useAtomValue(searchQueryAtom);

  const { location: currentLocation, fetchLocation } = useCurrentLocation();
  const router = useRouter();
  const supabase = createClient();

  // 현재 로그인한 사용자 정보를 가져옴
  const { data: user } = useSuspenseQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch real data using TanStack Query
  const { data: posts } = useSuspenseQuery<Post[]>({
    queryKey: postKeys.lists(user?.id),
    queryFn: () => getPosts(user!.id),
  });

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post) =>
      post.place_name?.toLowerCase().includes(query),
    );
  }, [posts, searchQuery]);

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'latest') {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === 'rating') {
      return Number(b.rating) - Number(a.rating);
    }
    if (sortBy === 'distance') {
      if (!currentLocation) return 0;
      if (!a.lat || !a.lng || !b.lat || !b.lng) return 0;
      const distA = getDistance(
        currentLocation.lat,
        currentLocation.lng,
        a.lat,
        a.lng,
      );
      const distB = getDistance(
        currentLocation.lat,
        currentLocation.lng,
        b.lat,
        b.lng,
      );
      return distA - distB;
    }
    return 0;
  });

  return (
    <div className={styles.container}>
      {/* Filter / Sort Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterButtonGroup}>
          <button
            className={`${styles.filterButton} ${sortBy === 'latest' ? styles.activeFilterButton : ''}`}
            onClick={() => setSortBy('latest')}
          >
            <IcClock width={16} height={16} />
            <span>최신순</span>
          </button>
          <button
            className={`${styles.filterButton} ${sortBy === 'rating' ? styles.activeFilterButton : ''}`}
            onClick={() => setSortBy('rating')}
          >
            <IcOutlinestar width={16} height={16} />
            <span>별점순</span>
          </button>
          <button
            className={`${styles.filterButton} ${sortBy === 'distance' ? styles.activeFilterButton : ''}`}
            onClick={() => {
              setSortBy('distance');
              if (!currentLocation) {
                fetchLocation().catch((err) =>
                  console.error('Error getting location for sorting', err),
                );
              }
            }}
          >
            <IcNavigation width={16} height={16} />
            <span>거리순</span>
          </button>
        </div>

        <div className={styles.reviewCount}>
          총 {filteredPosts.length}개의 리뷰
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.contentWrapper}>
        <div className={styles.grid}>
          {sortedPosts.map((post) => (
            <Card
              key={post.id}
              onClick={() => router.push(`/post/${post.id}`)}
              style={{ cursor: 'pointer' }}
              title={post.place_name || '이름 없음'}
              rating={Number(post.rating).toFixed(1) || '0.0'}
              location={post.address || '주소 정보 없음'}
              description={post.content}
              date={new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              imageUrl={post.image_urls?.[0]}
              {...(post.image_urls?.[0]
                ? getCardImageProps(post.image_urls[0])
                : {})}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
