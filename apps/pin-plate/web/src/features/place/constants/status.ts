import type { PlaceStatus } from '../types/place';

export const PLACE_STATUS_LABEL: Record<PlaceStatus, string> = {
  wish: '가보고싶음',
  visited: '다녀옴',
  want_to_revisit: '다시가고싶음',
  recommend: '추천하고싶음',
};

export const PLACE_STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '전체' },
  { value: 'wish' as const, label: '가보고싶음' },
  { value: 'visited' as const, label: '다녀옴' },
  { value: 'want_to_revisit' as const, label: '다시가고싶음' },
];

export const WISH_PIN_COLOR = '#BDBDBD';
export const WANT_TO_REVISIT_PIN_COLOR = '#4F8EF7';
export const RECOMMEND_PIN_COLOR = '#F5A623';
