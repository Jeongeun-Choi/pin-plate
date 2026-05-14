import { getTagLabel } from '@/features/post/constants/tags';
import type { SharedMapPlace } from '../types/sharedMap';
import { SaveSharedPlaceButton } from './SaveSharedPlaceButton';
import * as s from './SharedMapView.css';

interface Props {
  places: SharedMapPlace[];
}

const formatRating = (rating: number): string =>
  Number.isInteger(rating) ? `${rating}` : rating.toFixed(1);

export const SharedPlaceList = ({ places }: Props) => {
  if (places.length === 0) {
    return <p className={s.empty}>공유된 장소가 없어요.</p>;
  }

  return (
    <ol className={s.list} aria-label="공유된 추천 장소">
      {places.map((place) => (
        <li key={place.id} className={s.placeCard}>
          <div className={s.placeHeader}>
            <div>
              <h2 className={s.placeName}>{place.place_name}</h2>
              <p className={s.address}>{place.address}</p>
            </div>
            <SaveSharedPlaceButton sharedPlace={place} />
          </div>

          <div className={s.stats} aria-label={`${place.place_name} 정보`}>
            {place.avg_rating != null && (
              <span className={s.stat}>
                평점 {formatRating(place.avg_rating)}
              </span>
            )}
            <span className={s.stat}>방문 {place.visit_count}회</span>
          </div>

          {place.tags.length > 0 && (
            <ul className={s.tagList} aria-label={`${place.place_name} 태그`}>
              {place.tags.map((tag) => (
                <li key={tag} className={s.tag}>
                  {getTagLabel(tag)}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
};
