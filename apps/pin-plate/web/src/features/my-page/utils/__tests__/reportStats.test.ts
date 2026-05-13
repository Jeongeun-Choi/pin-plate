import { describe, expect, it } from 'vitest';
import type { Post } from '@/features/post/types/post';
import { buildMyPageReportStats } from '../reportStats';

const createPost = (overrides: Partial<Post>): Post => ({
  id: 1,
  created_at: '2026-05-13T03:00:00.000Z',
  content: '맛있어요',
  rating: 4.5,
  image_urls: [],
  place_name: '성수 파스타',
  address: '서울 성동구',
  lat: 37.5446,
  lng: 127.0557,
  kakao_place_id: 'kakao-place-id',
  user_id: 'user-id',
  tags: ['파스타'],
  ...overrides,
});

describe('buildMyPageReportStats', () => {
  it('aggregates current-week places by post count', () => {
    const stats = buildMyPageReportStats(
      [
        createPost({ id: 1, place_name: '성수 파스타' }),
        createPost({ id: 2, place_name: '성수 파스타' }),
        createPost({ id: 3, place_name: '망원 카페' }),
        createPost({
          id: 4,
          place_name: '지난주 식당',
          created_at: '2026-05-09T03:00:00.000Z',
        }),
      ],
      new Date('2026-05-13T12:00:00.000Z'),
    );

    expect(stats.weeklyRestaurants).toEqual([
      { name: '성수 파스타', count: 2 },
      { name: '망원 카페', count: 1 },
    ]);
  });

  it('aggregates current-month areas by address and tags from real post data', () => {
    const stats = buildMyPageReportStats(
      [
        createPost({
          id: 1,
          place_name: '성수 파스타',
          address: '서울특별시 성동구 성수동1가 12',
          tags: ['파스타', '재방문'],
        }),
        createPost({
          id: 2,
          place_name: '성수 파스타',
          address: '서울특별시 성동구 성수동2가 34',
          tags: ['파스타'],
        }),
        createPost({
          id: 3,
          place_name: '연남 델리',
          address: '서울특별시 마포구 연남동 56',
          created_at: '2026-05-01T01:00:00.000Z',
          tags: ['델리'],
        }),
        createPost({
          id: 5,
          place_name: '까사부사노 해운대점',
          address: '서울특별시',
          created_at: '2026-05-12T01:00:00.000Z',
          tags: ['카페'],
        }),
        createPost({
          id: 6,
          place_name: '분당 식당',
          address: '경기도 성남시 분당구 정자동 1',
          created_at: '2026-05-13T01:00:00.000Z',
          tags: ['한식'],
        }),
        createPost({
          id: 4,
          place_name: '지난달 식당',
          created_at: '2026-04-29T23:00:00.000Z',
          tags: ['제외'],
        }),
      ],
      new Date('2026-05-13T12:00:00.000Z'),
    );

    expect(stats.monthlyRestaurants).toEqual([
      { name: '성수 파스타', count: 2 },
      { name: '까사부사노 해운대점', count: 1 },
      { name: '분당 식당', count: 1 },
      { name: '연남 델리', count: 1 },
    ]);
    expect(stats.weeklyAreas).toEqual([
      { name: '서울시 성동구', count: 2 },
      { name: '까사부사노 해운대점', count: 1 },
      { name: '성남시 분당구', count: 1 },
    ]);
    expect(stats.monthlyAreas).toEqual([
      { name: '서울시 성동구', count: 2 },
      { name: '까사부사노 해운대점', count: 1 },
      { name: '서울시 마포구', count: 1 },
      { name: '성남시 분당구', count: 1 },
    ]);
    expect(stats.topTags).toEqual([
      { name: '파스타', count: 2 },
      { name: '델리', count: 1 },
      { name: '재방문', count: 1 },
      { name: '카페', count: 1 },
    ]);
  });
});
