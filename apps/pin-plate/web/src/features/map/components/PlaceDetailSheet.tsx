'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Spinner, IcDismiss } from '@pin-plate/ui';
import { clickedMapInfoAtom, selectedSearchPlaceAtom } from '../atoms';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';
import { isPostModalOpenAtom, prefillPlaceAtom } from '@/features/post/atoms';
import { useCreatePlace } from '@/features/place/hooks/useCreatePlace';
import { useDeletePlace } from '@/features/place/hooks/useDeletePlace';
import { usePlaces } from '@/features/place/hooks/usePlaces';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import type { Place } from '@/features/post/types/search';
import { getDesktopSheetPosition } from '../utils/placeDetailSheetPosition';
import { NearbyPlaceList } from './NearbyPlaceList';
import * as s from './PlaceDetailSheet.css';
import { useToast } from '@/providers/ToastProvider';

export const PlaceDetailSheet = () => {
  const openedAtRef = useRef(0);
  const [clickedInfo, setClickedInfo] = useAtom(clickedMapInfoAtom);
  const [selectedSearchPlace, setSelectedSearchPlace] = useAtom(
    selectedSearchPlaceAtom,
  );
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);
  const setPrefillPlace = useSetAtom(prefillPlaceAtom);

  const { mutateAsync: createPlace, isPending: isAddingWish } =
    useCreatePlace();
  const { mutateAsync: removePlace, isPending: isRemovingWish } =
    useDeletePlace();

  const { data: places } = usePlaces();
  const { showErrorToast, showToast } = useToast();

  const isDirectPlace = !!selectedSearchPlace;

  const coords =
    !isDirectPlace && clickedInfo
      ? { lat: clickedInfo.lat, lng: clickedInfo.lng }
      : null;

  const { data: nearbyRestaurants, isLoading: isNearbyRestaurantsLoading } =
    useNearbyRestaurants(coords);

  const displayPlaces = selectedSearchPlace
    ? [selectedSearchPlace]
    : (nearbyRestaurants ?? []);
  const savedWishPlaceIdByKakaoId = useMemo(() => {
    const wishPlaceEntries =
      places?.flatMap((place) => {
        if (!place.kakao_place_id || place.status !== 'wish') return [];
        return [[place.kakao_place_id, place.id] as const];
      }) ?? [];

    return new Map(wishPlaceEntries);
  }, [places]);
  const desktopSheetPosition = useMemo(() => {
    if (!clickedInfo) return null;
    return getDesktopSheetPosition(clickedInfo.clientX, clickedInfo.clientY);
  }, [clickedInfo]);
  const isWishMutating = isAddingWish || isRemovingWish;

  const handleClose = () => {
    if (Date.now() - openedAtRef.current < 300) return;
    setClickedInfo(null);
    setSelectedSearchPlace(null);
  };

  const handleWritePost = (place: Place) => {
    setPrefillPlace(place);
    setIsPostModalOpen(true);
    setClickedInfo(null);
  };

  const handleRemoveWish = async (placeId: string) => {
    try {
      await removePlace(placeId);
    } catch {
      showErrorToast({
        title: '장소 삭제에 실패했어요',
        description: '잠시 후 다시 시도해 주세요.',
      });
    }
  };

  const handleAddWish = async (place: Place) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        showErrorToast({
          title: '로그인이 필요해요',
          description: '로그인한 사용자만 장소를 저장할 수 있어요.',
        });
        return;
      }
      await createPlace({
        userId: currentUser.id,
        payload: {
          kakao_place_id: place.id,
          place_name: place.place_name,
          address: place.road_address_name || place.address_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
          status: 'wish',
          tags: [],
        },
      });
    } catch (err: unknown) {
      const pgError = err as { code?: string };
      if (pgError?.code === '23505') {
        showToast({
          title: '이미 저장된 장소예요',
          description: '내 지도에서 확인할 수 있어요.',
          variant: 'info',
        });
      } else {
        showErrorToast({
          title: '장소 저장에 실패했어요',
          description: '잠시 후 다시 시도해 주세요.',
        });
      }
    }
  };

  useEffect(() => {
    if (clickedInfo) {
      openedAtRef.current = Date.now();
    }
  }, [clickedInfo]);

  if (!clickedInfo) return null;

  const desktopStyle = {
    '--click-x': `${clickedInfo.clientX}px`,
    '--click-y': `${clickedInfo.clientY}px`,
    ...desktopSheetPosition?.style,
  } as CSSProperties;

  return (
    <>
      <div className={s.backdrop} onClick={handleClose} />
      <div
        className={s.sheet}
        style={desktopStyle}
        data-placement={desktopSheetPosition?.placement ?? 'above'}
      >
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
          ) : displayPlaces.length > 0 ? (
            <NearbyPlaceList
              places={displayPlaces}
              savedWishPlaceIdByKakaoId={savedWishPlaceIdByKakaoId}
              shouldShowResultSummary={!isDirectPlace}
              isWishMutating={isWishMutating}
              onAddWish={handleAddWish}
              onRemoveWish={handleRemoveWish}
              onWritePost={handleWritePost}
            />
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
