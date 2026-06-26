import type {
  CreateLocalPlaceInput,
  LocalPlaceWithStats,
} from '@/features/local-db/types';
import type { SharedMapPlace } from '../types/sharedMap';

export type SaveSharedPlaceResult = 'saved' | 'already_saved';

export const getSharedPlaceLocalSaveStatus = (
  sharedPlace: SharedMapPlace,
  localPlaces: LocalPlaceWithStats[],
): SaveSharedPlaceResult => {
  const hasAlreadySaved = localPlaces.some(
    (place) => place.kakao_place_id === sharedPlace.kakao_place_id,
  );
  return hasAlreadySaved ? 'already_saved' : 'saved';
};

export const buildLocalPlaceFromSharedPlace = (
  sharedPlace: SharedMapPlace,
): CreateLocalPlaceInput => {
  const now = new Date().toISOString();
  return {
    kakao_place_id: sharedPlace.kakao_place_id,
    place_name: sharedPlace.place_name,
    address: sharedPlace.address,
    lat: sharedPlace.lat,
    lng: sharedPlace.lng,
    status: 'wish',
    tags: sharedPlace.tags,
    created_at: now,
    updated_at: now,
  };
};
