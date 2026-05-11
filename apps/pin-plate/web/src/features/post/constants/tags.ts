export type TagGroup = 'purpose' | 'vibe' | 'food' | 'judgment';

export interface TagDefinition {
  id: string;
  label: string;
  group: TagGroup;
}

export const TAG_GROUPS: Record<
  TagGroup,
  { label: string; tags: TagDefinition[] }
> = {
  purpose: {
    label: '목적',
    tags: [
      { id: 'solo', label: '혼밥', group: 'purpose' },
      { id: 'date', label: '데이트', group: 'purpose' },
      { id: 'friends', label: '친구모임', group: 'purpose' },
      { id: 'family', label: '가족식사', group: 'purpose' },
      { id: 'work', label: '작업하기좋음', group: 'purpose' },
    ],
  },
  vibe: {
    label: '분위기',
    tags: [
      { id: 'quiet', label: '조용한', group: 'vibe' },
      { id: 'hip', label: '힙한', group: 'vibe' },
      { id: 'cozy', label: '아늑한', group: 'vibe' },
      { id: 'view', label: '뷰좋은', group: 'vibe' },
      { id: 'photogenic', label: '사진맛집', group: 'vibe' },
    ],
  },
  food: {
    label: '음식',
    tags: [
      { id: 'korean', label: '한식', group: 'food' },
      { id: 'japanese', label: '일식', group: 'food' },
      { id: 'chinese', label: '중식', group: 'food' },
      { id: 'western', label: '양식', group: 'food' },
      { id: 'bunsik', label: '분식', group: 'food' },
      { id: 'asian', label: '아시안', group: 'food' },
      { id: 'mexican', label: '멕시칸/타코', group: 'food' },
      { id: 'cafe', label: '카페', group: 'food' },
      { id: 'bakery', label: '베이커리', group: 'food' },
      { id: 'dessert', label: '디저트', group: 'food' },
      { id: 'bar', label: '술집', group: 'food' },
      { id: 'wine-bar', label: '와인바', group: 'food' },
      { id: 'brunch', label: '브런치', group: 'food' },
      { id: 'vegan', label: '비건/건강식', group: 'food' },
    ],
  },
  judgment: {
    label: '판단',
    tags: [
      { id: 'revisit', label: '또갈곳', group: 'judgment' },
      { id: 'recommend', label: '추천가능', group: 'judgment' },
      { id: 'value', label: '가성비', group: 'judgment' },
      { id: 'special', label: '특별한날', group: 'judgment' },
      { id: 'once', label: '한번이면충분', group: 'judgment' },
    ],
  },
};

export const ALL_TAGS: TagDefinition[] = Object.values(TAG_GROUPS).flatMap(
  (g) => g.tags,
);

const TAG_SLUG_SET = new Set(ALL_TAGS.map((t) => t.id));

export const getTagLabel = (id: string): string =>
  ALL_TAGS.find((t) => t.id === id)?.label ?? id;

export const sanitizeTags = (tags: string[]): string[] =>
  [...new Set(tags)].filter((id) => TAG_SLUG_SET.has(id));
