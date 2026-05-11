'use client';

import * as styles from './PostList.css';
import { useMemo, useState } from 'react';
import { getImageProps } from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtom, useAtomValue } from 'jotai';
import { Card, IcClock, IcNavigation, IcOutlinestar } from '@pin-plate/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getPlaces } from '../../place/api/getPlaces';
import { placeKeys } from '../../place/placeKeys';
import { PlaceStatusBadge } from '../../place/components/PlaceStatusBadge';
import { PLACE_STATUS_FILTER_OPTIONS } from '../../place/constants/status';
import type { PlaceWithStats } from '../../place/types/place';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { searchQueryAtom } from '@/app/atoms';
import { statusFilterAtom } from '@/features/map/atoms';

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

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const PostList = () => {
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);

  const searchQuery = useAtomValue(searchQueryAtom);

  const { location: currentLocation, fetchLocation } = useCurrentLocation();
  const router = useRouter();

  const { data: user } = useSuspenseQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  const { data: places } = useSuspenseQuery<PlaceWithStats[]>({
    queryKey: placeKeys.lists(user?.id),
    queryFn: () => getPlaces(user!.id),
  });

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query || place.place_name.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || place.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [places, searchQuery, statusFilter]);

  const sortedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => {
      if (sortBy === 'latest') {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortBy === 'rating') {
        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      }
      if (sortBy === 'distance' && currentLocation) {
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
  }, [filteredPlaces, sortBy, currentLocation]);

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        {/* 상태 필터 */}
        <div className={styles.filterButtonGroup}>
          {PLACE_STATUS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`${styles.filterButton} ${statusFilter === option.value ? styles.activeFilterButton : ''}`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 정렬 */}
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
          총 {filteredPlaces.length}개의 장소
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.grid}>
          {sortedPlaces.map((place) => {
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

            const ratingDisplay =
              place.status === 'wish' || place.avg_rating == null
                ? '—'
                : place.avg_rating.toFixed(1);

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
                : place.visit_count > 1
                  ? `총 ${place.visit_count}번 방문`
                  : undefined;

            return (
              <div key={place.id} style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 1,
                  }}
                >
                  <PlaceStatusBadge status={place.status} />
                </div>
                <Card
                  onClick={handleClick}
                  style={{ cursor: 'pointer' }}
                  title={place.place_name}
                  rating={ratingDisplay}
                  location={place.address}
                  description={description ?? ''}
                  date={dateDisplay}
                  imageUrl={place.first_image ?? undefined}
                  {...(place.first_image
                    ? getCardImageProps(place.first_image)
                    : {})}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
