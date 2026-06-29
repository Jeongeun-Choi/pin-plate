'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlaceByKakaoId } from '@/features/place/api/getPlaceByKakaoId';
import { useCreatePlace } from '@/features/place/hooks/useCreatePlace';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import type { SharedMapPlace } from '../types/sharedMap';
import * as s from './SharedMapView.css';

interface Props {
  sharedPlace: SharedMapPlace;
}

type SaveButtonState =
  | 'idle'
  | 'saved'
  | 'already_saved'
  | 'failed'
  | 'login_required';

const buttonTextByState: Record<SaveButtonState, string> = {
  idle: '내 지도에 저장',
  saved: '저장됐어요',
  already_saved: '이미 저장됐어요',
  failed: '저장하지 못했어요',
  login_required: '로그인 후 저장 가능해요',
};

export const SaveSharedPlaceButton = ({ sharedPlace }: Props) => {
  const [saveButtonState, setSaveButtonState] =
    useState<SaveButtonState>('idle');
  const [isSavingSharedPlace, setIsSavingSharedPlace] = useState(false);

  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
  });

  const { mutateAsync: createPlace, isPending: isCreatingPlace } =
    useCreatePlace();

  const { data: existingSavedPlace, isLoading: isExistingSavedPlaceLoading } =
    useQuery({
      queryKey: [
        'shared-map',
        'existing-place',
        currentUser?.id,
        sharedPlace.kakao_place_id,
      ],
      queryFn: () => {
        if (!currentUser) return null;
        return getPlaceByKakaoId(currentUser.id, sharedPlace.kakao_place_id);
      },
      enabled: Boolean(currentUser),
    });

  const handleSaveClick = useCallback(async () => {
    if (isSavingSharedPlace || !currentUser) {
      return;
    }

    setIsSavingSharedPlace(true);

    try {
      if (existingSavedPlace) {
        setSaveButtonState('already_saved');
        return;
      }

      const existingPlace = await getPlaceByKakaoId(
        currentUser.id,
        sharedPlace.kakao_place_id,
      );

      if (existingPlace) {
        setSaveButtonState('already_saved');
        return;
      }

      await createPlace({
        userId: currentUser.id,
        payload: {
          kakao_place_id: sharedPlace.kakao_place_id,
          place_name: sharedPlace.place_name,
          address: sharedPlace.address,
          lat: sharedPlace.lat,
          lng: sharedPlace.lng,
          status: 'wish',
          tags: sharedPlace.tags,
        },
      });
      setSaveButtonState('saved');
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        setSaveButtonState('already_saved');
        return;
      }

      setSaveButtonState('failed');
    } finally {
      setIsSavingSharedPlace(false);
    }
  }, [
    createPlace,
    currentUser,
    existingSavedPlace,
    isSavingSharedPlace,
    sharedPlace,
  ]);

  const isLoginRequired = !isCurrentUserLoading && !currentUser;
  const displaySaveButtonState: SaveButtonState = isLoginRequired
    ? 'login_required'
    : existingSavedPlace
      ? 'already_saved'
      : saveButtonState;
  const isSaveComplete =
    displaySaveButtonState === 'saved' ||
    displaySaveButtonState === 'already_saved';
  const isSaveButtonDisabled =
    isCurrentUserLoading ||
    isExistingSavedPlaceLoading ||
    isCreatingPlace ||
    isSavingSharedPlace ||
    isSaveComplete ||
    isLoginRequired;
  const buttonText = buttonTextByState[displaySaveButtonState];

  return (
    <button
      type="button"
      className={s.saveButton}
      disabled={isSaveButtonDisabled}
      aria-label={`${sharedPlace.place_name} ${buttonText}`}
      aria-busy={
        isCurrentUserLoading ||
        isExistingSavedPlaceLoading ||
        isCreatingPlace ||
        isSavingSharedPlace
      }
      aria-live={displaySaveButtonState === 'idle' ? undefined : 'polite'}
      onClick={handleSaveClick}
    >
      {buttonText}
    </button>
  );
};
