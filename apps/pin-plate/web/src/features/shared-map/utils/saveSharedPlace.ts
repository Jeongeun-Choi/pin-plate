import type { GuestPost } from '@/features/guest/types/guestPost';
import type { SharedMapPlace } from '../types/sharedMap';

export type SaveSharedPlaceResult = 'saved' | 'already_saved';

export const getSharedPlaceGuestSaveStatus = (
  sharedPlace: SharedMapPlace,
  guestPosts: GuestPost[],
): SaveSharedPlaceResult => {
  const hasAlreadySaved = guestPosts.some(
    (guestPost) => guestPost.kakao_place_id === sharedPlace.kakao_place_id,
  );

  return hasAlreadySaved ? 'already_saved' : 'saved';
};

export const buildGuestPostFromSharedPlace = (
  sharedPlace: SharedMapPlace,
): GuestPost => {
  // Compatibility bridge until guest place storage exists.
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    place_name: sharedPlace.place_name,
    address: sharedPlace.address,
    lat: sharedPlace.lat,
    lng: sharedPlace.lng,
    kakao_place_id: sharedPlace.kakao_place_id,
    content: '공유 지도에서 저장한 가보고 싶은 장소예요.',
    rating: 0,
    image_urls: sharedPlace.first_image ? [sharedPlace.first_image] : [],
    tags: sharedPlace.tags,
    status: 'wish',
    has_visit_record: false,
  };
};
