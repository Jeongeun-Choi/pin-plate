'use client';

import * as styles from './PlaceList.css';
import { useMemo, useState } from 'react';
import { getImageProps } from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtom, useAtomValue } from 'jotai';
import { Card } from '@pin-plate/ui';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getPlaces } from '../../place/api/getPlaces';
import { placeKeys } from '../../place/placeKeys';
import type { PlaceWithStats } from '../../place/types/place';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { searchQueryAtom } from '@/app/atoms';
import { statusFilterAtom } from '@/features/map/atoms';
import { getTrustedImageUrl } from '@/features/image/utils/imageReference';
import type { User } from '@supabase/supabase-js';

const CARD_IMAGE_WIDTH = 360;
const CARD_IMAGE_HEIGHT = 240;
const CARD_IMAGE_SIZES = '(min-width: 1024px) 320px, 100vw';
type SortType = 'latest' | 'rating';

const PLACE_LIST_STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '전체' },
  { value: 'wish' as const, label: '가볼 곳' },
  { value: 'visited' as const, label: '기록한 곳' },
];

const getOptimizedCardImageProps = (
  imageUrl: string | null | undefined,
  title: string,
) => {
  const trustedImageUrl = getTrustedImageUrl(imageUrl ?? null);

  if (!trustedImageUrl) {
    return { imageUrl: imageUrl ?? undefined };
  }

  const { props } = getImageProps({
    src: trustedImageUrl,
    alt: title,
    width: CARD_IMAGE_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    sizes: CARD_IMAGE_SIZES,
  });

  return {
    imageUrl: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes,
  };
};

interface AuthenticatedPlaceListProps {
  user: User;
}

const AuthenticatedPlaceList = ({ user }: AuthenticatedPlaceListProps) => {
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const router = useRouter();

  const { data: places } = useSuspenseQuery<PlaceWithStats[]>({
    queryKey: placeKeys.lists(user.id),
    queryFn: () => getPlaces(user.id),
  });

  const searchFilteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return places.filter(
      (place) => !query || place.place_name.toLowerCase().includes(query),
    );
  }, [places, searchQuery]);

  const statusFilteredPlaces = useMemo(() => {
    return searchFilteredPlaces.filter(
      (place) => statusFilter === 'all' || place.status === statusFilter,
    );
  }, [searchFilteredPlaces, statusFilter]);

  const visiblePlaces = useMemo(() => {
    return [...statusFilteredPlaces].sort((a, b) => {
      if (sortBy === 'latest') {
        return (
          new Date(b.last_visited_at ?? b.created_at).getTime() -
          new Date(a.last_visited_at ?? a.created_at).getTime()
        );
      }

      return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
    });
  }, [statusFilteredPlaces, sortBy]);

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.filterTopRow}>
          <div className={styles.reviewCount}>
            총 {visiblePlaces.length}개의 장소
          </div>
        </div>

        <div className={styles.filterControlRow}>
          <div className={styles.filterButtonGroup}>
            {PLACE_LIST_STATUS_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`${styles.filterButton} ${statusFilter === option.value ? styles.activeFilterButton : ''}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.sortButtonGroup}>
            <button
              className={`${styles.filterButton} ${sortBy === 'latest' ? styles.activeFilterButton : ''}`}
              onClick={() => setSortBy('latest')}
            >
              최근 기록순
            </button>
            <button
              className={`${styles.filterButton} ${sortBy === 'rating' ? styles.activeFilterButton : ''}`}
              onClick={() => setSortBy('rating')}
            >
              별점순
            </button>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.grid}>
          {visiblePlaces.map((place) => {
            const latestPost = [...place.posts]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .at(0);

            const handleClick = () => {
              if (latestPost) {
                router.push(`/post/${latestPost.id}`);
              }
            };

            const isWishPlace = place.status === 'wish';
            const ratingDisplay =
              isWishPlace || place.avg_rating == null
                ? ''
                : place.avg_rating.toFixed(1);
            const ratingAriaLabel = isWishPlace
              ? '가보고 싶은 장소'
              : ratingDisplay
                ? `별점 ${ratingDisplay}`
                : '별점 없음';

            const dateDisplay = place.last_visited_at
              ? new Date(place.last_visited_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date(place.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

            const description =
              place.status === 'wish'
                ? '아직 방문하지 않은 장소'
                : place.visit_count > 0
                  ? `총 ${place.visit_count}번 방문`
                  : undefined;
            const imageProps = getOptimizedCardImageProps(
              place.first_image,
              place.place_name,
            );

            return (
              <div key={place.id}>
                <Card
                  onClick={handleClick}
                  style={{ cursor: 'pointer' }}
                  title={place.place_name}
                  rating={ratingDisplay}
                  ratingIcon={isWishPlace ? 'bookmark' : 'star'}
                  ratingAriaLabel={ratingAriaLabel}
                  location={place.address}
                  description={description ?? ''}
                  date={dateDisplay}
                  {...imageProps}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PlaceList = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  if (isLoading || !user) return null;

  return <AuthenticatedPlaceList user={user} />;
};
