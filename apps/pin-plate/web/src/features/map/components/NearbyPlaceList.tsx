import { Button, IcBookmark, IcFilledBookmark, IcMarker } from '@pin-plate/ui';
import type { Place } from '@/features/post/types/search';
import * as s from './NearbyPlaceList.css';

interface Props {
  places: Place[];
  savedWishPlaceIdByKakaoId: ReadonlyMap<string, string>;
  shouldShowResultSummary: boolean;
  isWishMutating: boolean;
  onAddWish: (place: Place) => void;
  onRemoveWish: (placeId: string) => void;
  onWritePost: (place: Place) => void;
}

const formatCategory = (categoryName: string) => {
  const parts = categoryName.split(' > ');
  return parts.slice(1).join(' > ') || categoryName;
};

const formatDistance = (distance: string) => {
  const meters = Number(distance);
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${distance}m`;
};

export const NearbyPlaceList = ({
  places,
  savedWishPlaceIdByKakaoId,
  shouldShowResultSummary,
  isWishMutating,
  onAddWish,
  onRemoveWish,
  onWritePost,
}: Props) => {
  return (
    <>
      {shouldShowResultSummary && (
        <div className={s.resultSummary}>주변 음식점 {places.length}곳</div>
      )}
      <ul className={s.list}>
        {places.map((place) => {
          const savedPlaceId = savedWishPlaceIdByKakaoId.get(place.id);
          const isAlreadySaved = savedPlaceId != null;

          return (
            <li key={place.id} className={s.item}>
              <div className={s.detailSection}>
                <div className={s.headerRow}>
                  <div className={s.placeTextGroup}>
                    <div className={s.placeName}>{place.place_name}</div>
                    {place.category_name && (
                      <div className={s.category}>
                        {formatCategory(place.category_name)}
                      </div>
                    )}
                  </div>
                </div>
                <div className={s.infoRow}>
                  <IcMarker width={14} height={14} />
                  <span>{place.road_address_name || place.address_name}</span>
                </div>
                {place.phone && (
                  <div className={s.infoRow}>
                    <span className={s.phoneLabel}>전화</span>
                    <span>{place.phone}</span>
                  </div>
                )}
                {place.distance && (
                  <div className={s.distanceText}>
                    {formatDistance(place.distance)}
                  </div>
                )}
              </div>
              <div className={s.buttonGroup}>
                <Button
                  variant="outline"
                  size="full"
                  className={s.wishButton}
                  onClick={() =>
                    savedPlaceId ? onRemoveWish(savedPlaceId) : onAddWish(place)
                  }
                  disabled={isWishMutating}
                >
                  {isAlreadySaved ? (
                    <IcFilledBookmark width={16} height={16} />
                  ) : (
                    <IcBookmark width={16} height={16} />
                  )}
                </Button>
                <Button
                  variant="solid"
                  size="full"
                  onClick={() => onWritePost(place)}
                >
                  글 작성하기
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
