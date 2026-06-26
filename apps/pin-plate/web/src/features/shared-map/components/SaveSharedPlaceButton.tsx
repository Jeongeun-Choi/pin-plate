'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalPlacesWithStats } from '@/features/local-db/hooks/useLocalPlacesWithStats';
import { useLocalCreatePlace } from '@/features/local-db/hooks/useLocalCreatePlace';
import { getPlaceByKakaoId } from '@/features/place/api/getPlaceByKakaoId';
import { useCreatePlace } from '@/features/place/hooks/useCreatePlace';
import { getCurrentUser } from '@/utils/supabase/getCurrentUser';
import type { SharedMapPlace } from '../types/sharedMap';
import {
  buildLocalPlaceFromSharedPlace,
  getSharedPlaceLocalSaveStatus,
  type SaveSharedPlaceResult,
} from '../utils/saveSharedPlace';
import * as s from './SharedMapView.css';

interface Props {
  sharedPlace: SharedMapPlace;
}

type SaveButtonState = 'idle' | SaveSharedPlaceResult | 'failed';

const buttonTextByState: Record<SaveButtonState, string> = {
  idle: '내 지도에 저장',
  saved: '저장됐어요',
  already_saved: '이미 저장됐어요',
  failed: '저장하지 못했어요',
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

  const { mutateAsync: createLocalPlace, isPending: isCreatingLocalPlace } =
    useLocalCreatePlace();

  const { data: localPlaces = [] } = useLocalPlacesWithStats();

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
    if (isSavingSharedPlace) {
      return;
    }

    setIsSavingSharedPlace(true);

    try {
      if (!currentUser) {
        const localSaveStatus = getSharedPlaceLocalSaveStatus(
          sharedPlace,
          localPlaces,
        );

        if (localSaveStatus === 'already_saved') {
          setSaveButtonState('already_saved');
          return;
        }

        await createLocalPlace(buildLocalPlaceFromSharedPlace(sharedPlace));
        setSaveButtonState('saved');
        return;
      }

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
    createLocalPlace,
    createPlace,
    currentUser,
    existingSavedPlace,
    isSavingSharedPlace,
    localPlaces,
    sharedPlace,
  ]);

  const hasLocalSavedSharedPlace =
    currentUser === null &&
    getSharedPlaceLocalSaveStatus(sharedPlace, localPlaces) === 'already_saved';
  const displaySaveButtonState: SaveButtonState =
    hasLocalSavedSharedPlace || existingSavedPlace
      ? 'already_saved'
      : saveButtonState;
  const isSaveComplete =
    displaySaveButtonState === 'saved' ||
    displaySaveButtonState === 'already_saved';
  const isSaveButtonDisabled =
    isCurrentUserLoading ||
    isExistingSavedPlaceLoading ||
    isCreatingPlace ||
    isCreatingLocalPlace ||
    isSavingSharedPlace ||
    isSaveComplete;
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
        isCreatingLocalPlace ||
        isSavingSharedPlace
      }
      aria-live={displaySaveButtonState === 'idle' ? undefined : 'polite'}
      onClick={handleSaveClick}
    >
      {buttonText}
    </button>
  );
};
