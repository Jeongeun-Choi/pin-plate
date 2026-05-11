import type { PlaceStatus } from '../types/place';

export const PLACE_STATUS_LABEL: Record<PlaceStatus, string> = {
  wish: '가보고싶음',
  visited: '다녀옴',
  want_to_revisit: '다시가고싶음',
  recommend: '추천하고싶음',
};

export const PLACE_STATUS_FILTER_LABEL: Record<PlaceStatus | 'all', string> = {
  all: '전체',
  wish: '가볼 곳',
  visited: '다녀온',
  want_to_revisit: '또 갈 곳',
  recommend: '추천',
};

export const PLACE_STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: PLACE_STATUS_FILTER_LABEL.all },
  { value: 'wish' as const, label: PLACE_STATUS_FILTER_LABEL.wish },
  { value: 'visited' as const, label: PLACE_STATUS_FILTER_LABEL.visited },
  {
    value: 'want_to_revisit' as const,
    label: PLACE_STATUS_FILTER_LABEL.want_to_revisit,
  },
  { value: 'recommend' as const, label: PLACE_STATUS_FILTER_LABEL.recommend },
];

export const WISH_PIN_COLOR = '#BDBDBD';
export const WANT_TO_REVISIT_PIN_COLOR = '#4F8EF7';
export const RECOMMEND_PIN_COLOR = '#F5A623';
