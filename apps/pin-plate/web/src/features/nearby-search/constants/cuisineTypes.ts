export const CUISINE_TYPE_MAP = {
  all: ['restaurant', 'cafe', 'bakery'],
  korean: ['korean_restaurant'],
  japanese: ['japanese_restaurant', 'sushi_restaurant', 'ramen_restaurant'],
  chinese: ['chinese_restaurant'],
  western: ['italian_restaurant', 'american_restaurant', 'french_restaurant'],
  cafe: ['cafe', 'bakery'],
  bar: ['bar'],
} as const satisfies Record<string, readonly string[]>;

export type CuisineId = keyof typeof CUISINE_TYPE_MAP;

export const VALID_CUISINE_IDS = Object.keys(CUISINE_TYPE_MAP) as CuisineId[];
