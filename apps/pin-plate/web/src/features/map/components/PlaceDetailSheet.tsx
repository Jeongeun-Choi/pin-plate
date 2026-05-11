'use client';

import { useRef, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Button, Spinner, IcMarker, IcDismiss } from '@pin-plate/ui';
import { clickedMapInfoAtom, selectedSearchPlaceAtom } from '../atoms';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';
import { isPostModalOpenAtom, prefillPlaceAtom } from '@/features/post/atoms';
import { useCreatePlace } from '@/features/place/hooks/useCreatePlace';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import * as s from './PlaceDetailSheet.css';

export const PlaceDetailSheet = () => {
  const [clickedInfo, setClickedInfo] = useAtom(clickedMapInfoAtom);
  const [selectedSearchPlace, setSelectedSearchPlace] = useAtom(
    selectedSearchPlaceAtom,
  );
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);
  const setPrefillPlace = useSetAtom(prefillPlaceAtom);
  const openedAtRef = useRef(0);

  const { mutateAsync: createPlace, isPending: isAddingWish } =
    useCreatePlace();

  const isDirectPlace = !!selectedSearchPlace;

  const coords =
    !isDirectPlace && clickedInfo
      ? { lat: clickedInfo.lat, lng: clickedInfo.lng }
      : null;

  const { data: nearbyRestaurants, isLoading: isNearbyRestaurantsLoading } =
    useNearbyRestaurants(coords);

  const closestPlace = selectedSearchPlace ?? nearbyRestaurants?.[0] ?? null;

  const handleClose = () => {
    if (Date.now() - openedAtRef.current < 300) return;
    setClickedInfo(null);
    setSelectedSearchPlace(null);
  };

  const handleWritePost = () => {
    if (!closestPlace) return;
    setPrefillPlace(closestPlace);
    setIsPostModalOpen(true);
    setClickedInfo(null);
  };

  const handleAddWish = async () => {
    if (!closestPlace) return;
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
      }
      await createPlace({
        userId: currentUser.id,
        payload: {
          kakao_place_id: closestPlace.id,
          place_name: closestPlace.place_name,
          address: closestPlace.road_address_name || closestPlace.address_name,
          lat: parseFloat(closestPlace.y),
          lng: parseFloat(closestPlace.x),
          status: 'wish',
          tags: [],
        },
      });
      alert('위시리스트에 추가되었습니다!');
      handleClose();
    } catch (err: unknown) {
      const pgError = err as { code?: string };
      if (pgError?.code === '23505') {
        alert('이미 저장된 장소입니다.');
      } else {
        alert('저장에 실패했습니다.');
      }
    }
  };

  useEffect(() => {
    if (clickedInfo) {
      openedAtRef.current = Date.now();
    }
  }, [clickedInfo]);

  if (!clickedInfo) return null;

  const formatCategory = (categoryName: string) => {
    const parts = categoryName.split(' > ');
    return parts.slice(1).join(' > ') || categoryName;
  };

  const formatDistance = (distance: string) => {
    const meters = Number(distance);
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${distance}m`;
  };

  const desktopStyle = {
    '--click-x': `${clickedInfo.clientX}px`,
    '--click-y': `${clickedInfo.clientY}px`,
  } as React.CSSProperties;

  return (
    <>
      <div className={s.backdrop} onClick={handleClose} />
      <div className={s.sheet} style={desktopStyle}>
        <div className={s.handle} />
        <button
          type="button"
          className={s.closeButton}
          onClick={handleClose}
          aria-label="닫기"
        >
          <IcDismiss width={18} height={18} />
        </button>
        <div className={s.content}>
          {!isDirectPlace && isNearbyRestaurantsLoading ? (
            <div className={s.loadingContainer}>
              <Spinner />
              <span className={s.loadingText}>주변 음식점을 찾는 중...</span>
            </div>
          ) : closestPlace ? (
            <>
              <div className={s.detailSection}>
                <div className={s.placeName}>{closestPlace.place_name}</div>
                {closestPlace.category_name && (
                  <div className={s.category}>
                    {formatCategory(closestPlace.category_name)}
                  </div>
                )}
                <div className={s.infoRow}>
                  <IcMarker width={14} height={14} />
                  <span>
                    {closestPlace.road_address_name ||
                      closestPlace.address_name}
                  </span>
                </div>
                {closestPlace.phone && (
                  <div className={s.infoRow}>
                    <span className={s.phoneLabel}>전화</span>
                    <span>{closestPlace.phone}</span>
                  </div>
                )}
                {closestPlace.distance && (
                  <div className={s.distanceText}>
                    {formatDistance(closestPlace.distance)}
                  </div>
                )}
              </div>
              <div className={s.buttonGroup}>
                <Button
                  variant="outline"
                  size="full"
                  onClick={handleAddWish}
                  disabled={isAddingWish}
                >
                  가보고싶음
                </Button>
                <Button variant="solid" size="full" onClick={handleWritePost}>
                  글 작성하기
                </Button>
              </div>
            </>
          ) : (
            <div className={s.emptyContainer}>
              <span className={s.emptyText}>주변에 음식점이 없습니다.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
