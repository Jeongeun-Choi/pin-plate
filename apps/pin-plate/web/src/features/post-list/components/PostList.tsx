'use client';

import * as styles from './PostList.css';
import { useMemo, useState } from 'react';
import { getImageProps } from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtomValue, useSetAtom } from 'jotai';
import { Card, IcClock, IcNavigation, IcOutlinestar } from '@pin-plate/ui';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getPlaces } from '../../place/api/getPlaces';
import { placeKeys } from '../../place/placeKeys';
import { PlaceStatusBadge } from '../../place/components/PlaceStatusBadge';
import { StatusFilterChips } from '../../place/components/StatusFilterChips';
import type { PlaceWithStats } from '../../place/types/place';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import { searchQueryAtom } from '@/app/atoms';
import { currentLocationAtom, statusFilterAtom } from '@/features/map/atoms';
import { calcDistanceMeters } from '@/utils/distance';
import { useGuestPosts } from '@/features/guest/hooks/useGuestPosts';
import type { User } from '@supabase/supabase-js';

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

const GuestPostList = () => {
  const { guestPosts } = useGuestPosts();

  if (guestPosts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <p className={styles.emptyMessage}>
            로그인하고 나만의 맛집을 기록해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.grid}>
          {guestPosts.map((post) => (
            <Card
              key={post.id}
              title={post.place_name}
              rating={post.rating.toFixed(1)}
              location={post.address}
              description=""
              date={new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              imageUrl={post.image_urls[0] ?? undefined}
              {...(post.image_urls[0]
                ? getCardImageProps(post.image_urls[0])
                : {})}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface AuthenticatedPostListProps {
  user: User;
}

const AuthenticatedPostList = ({ user }: AuthenticatedPostListProps) => {
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const statusFilter = useAtomValue(statusFilterAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const currentLocation = useAtomValue(currentLocationAtom);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const router = useRouter();

  const { fetchLocation } = useCurrentLocation();

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
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (sortBy === 'rating') {
        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      }
      if (sortBy === 'distance' && currentLocation) {
        const distA = calcDistanceMeters(
          currentLocation.lat,
          currentLocation.lng,
          a.lat,
          a.lng,
        );
        const distB = calcDistanceMeters(
          currentLocation.lat,
          currentLocation.lng,
          b.lat,
          b.lng,
        );
        return distA - distB;
      }
      return 0;
    });
  }, [statusFilteredPlaces, sortBy, currentLocation]);

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.filterButtonGroup}>
          <StatusFilterChips />
        </div>

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
                fetchLocation()
                  .then((loc) => setCurrentLocation(loc))
                  .catch(console.error);
              }
            }}
          >
            <IcNavigation width={16} height={16} />
            <span>거리순</span>
          </button>
        </div>

        <div className={styles.reviewCount}>
          총 {visiblePlaces.length}개의 장소
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

export const PostList = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  if (isLoading) return null;

  if (!user) return <GuestPostList />;

  return <AuthenticatedPostList user={user} />;
};
