'use client';

import { useId } from 'react';
import { useRouter } from 'next/navigation';
import * as s from './GuestLocalPostsSection.css';
import { useLocalPlacesWithStats } from '@/features/local-db/hooks/useLocalPlacesWithStats';

export const GuestLocalPostsSection = () => {
  const titleId = useId();
  const router = useRouter();

  const { data: localPlaces = [] } = useLocalPlacesWithStats();

  const handleWriteClick = () => {
    router.push('/');
  };

  const handlePlaceClick = (placeId: string, postId: string | undefined) => {
    if (postId) {
      router.push(`/post/${postId}`);
    } else {
      router.push(`/`);
    }
  };

  const placeCount = localPlaces.length;

  return (
    <section className={s.container} aria-labelledby={titleId}>
      <div className={s.header}>
        <div>
          <h2 id={titleId} className={s.title}>
            이 기기에 저장된 기록
          </h2>
          <p className={s.description}>
            지금 브라우저에서 작성한 기록만 보여요.
          </p>
        </div>
        {placeCount > 0 && <span className={s.countBadge}>{placeCount}개</span>}
      </div>

      {placeCount === 0 ? (
        <div className={s.emptyState}>
          <p className={s.emptyText}>아직 이 기기에 저장된 기록이 없어요.</p>
          <button
            type="button"
            className={s.writeButton}
            onClick={handleWriteClick}
          >
            맛집 기록하러 가기
          </button>
        </div>
      ) : (
        <div className={s.previewList}>
          {localPlaces.slice(0, 3).map((place) => {
            const latestPost = [...place.posts]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .at(0);

            return (
              <button
                key={place.id}
                type="button"
                className={s.previewItem}
                onClick={() => handlePlaceClick(place.id, latestPost?.id)}
              >
                <span className={s.placeName}>{place.place_name}</span>
                <span className={s.rating}>
                  {place.avg_rating != null ? place.avg_rating.toFixed(1) : '—'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
