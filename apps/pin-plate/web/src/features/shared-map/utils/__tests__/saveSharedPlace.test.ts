import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuestPost } from '@/features/guest/types/guestPost';
import type { SharedMapPlace } from '../../types/sharedMap';
import {
  buildGuestPostFromSharedPlace,
  getSharedPlaceGuestSaveStatus,
} from '../saveSharedPlace';

const sharedPlace: SharedMapPlace = {
  id: 'place-1',
  shared_map_id: 'map-1',
  source_place_id: 'source-1',
  kakao_place_id: 'kakao-1',
  place_name: '성수 카페',
  address: '서울 성동구',
  lat: 37.5,
  lng: 127.1,
  status: 'recommend',
  tags: ['work'],
  avg_rating: 4.5,
  first_image: null,
  visit_count: 2,
  sort_order: 0,
  created_at: '2026-05-13T00:00:00.000Z',
};

describe('shared place guest save utilities', () => {
  beforeEach(() => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('guest-post-1');
  });

  it('builds a wish guest place from a shared place without copying the sharer rating', () => {
    const guestPost = buildGuestPostFromSharedPlace(sharedPlace);

    expect(guestPost).toMatchObject({
      id: 'guest-post-1',
      place_name: '성수 카페',
      kakao_place_id: 'kakao-1',
      content: '공유 지도에서 저장한 가보고 싶은 장소예요.',
      rating: 0,
      status: 'wish',
      tags: ['work'],
      has_visit_record: false,
    });
  });

  it('keeps shared places unrated even when the shared place has no average rating', () => {
    const guestPost = buildGuestPostFromSharedPlace({
      ...sharedPlace,
      avg_rating: null,
    });

    expect(guestPost.rating).toBe(0);
  });

  it('detects guest duplicates by kakao place id', () => {
    const existingGuestPost: GuestPost = {
      id: 'existing-post',
      created_at: '2026-05-13T00:00:00.000Z',
      place_name: '이미 저장한 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127.1,
      kakao_place_id: 'kakao-1',
      content: '기존 글',
      rating: 4,
      image_urls: [],
      tags: [],
    };

    const result = getSharedPlaceGuestSaveStatus(sharedPlace, [
      existingGuestPost,
    ]);

    expect(result).toBe('already_saved');
  });

  it('returns saved when the shared place is not already in guest posts', () => {
    const result = getSharedPlaceGuestSaveStatus(sharedPlace, []);

    expect(result).toBe('saved');
  });
});
