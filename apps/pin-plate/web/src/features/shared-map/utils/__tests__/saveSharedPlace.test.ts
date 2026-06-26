import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocalPlaceWithStats } from '@/features/local-db/types';
import type { SharedMapPlace } from '../../types/sharedMap';
import {
  buildLocalPlaceFromSharedPlace,
  getSharedPlaceLocalSaveStatus,
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

describe('shared place local save utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T00:00:00.000Z'));
  });

  it('builds a wish local place from a shared place without copying the sharer rating', () => {
    const localPlace = buildLocalPlaceFromSharedPlace(sharedPlace);

    expect(localPlace).toMatchObject({
      kakao_place_id: 'kakao-1',
      place_name: '성수 카페',
      address: '서울 성동구',
      status: 'wish',
      tags: ['work'],
    });
  });

  it('detects local duplicates by kakao place id', () => {
    const existingLocalPlace: LocalPlaceWithStats = {
      id: 'local-place-1',
      kakao_place_id: 'kakao-1',
      place_name: '이미 저장한 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127.1,
      status: 'wish',
      tags: [],
      created_at: '2026-05-13T00:00:00.000Z',
      updated_at: '2026-05-13T00:00:00.000Z',
      posts: [],
      visit_count: 0,
      avg_rating: null,
      last_visited_at: null,
      first_image: null,
    };

    const result = getSharedPlaceLocalSaveStatus(sharedPlace, [
      existingLocalPlace,
    ]);

    expect(result).toBe('already_saved');
  });

  it('returns saved when the shared place is not already in local places', () => {
    const result = getSharedPlaceLocalSaveStatus(sharedPlace, []);

    expect(result).toBe('saved');
  });
});
