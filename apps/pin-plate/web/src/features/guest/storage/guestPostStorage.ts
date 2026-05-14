import type { GuestPost } from '../types/guestPost';

export const GUEST_POSTS_KEY = 'guest_posts';
const VALID_GUEST_POST_STATUSES = [
  'wish',
  'visited',
  'want_to_revisit',
  'recommend',
];

const isValidGuestPostStatus = (status: unknown): boolean =>
  typeof status === 'undefined' ||
  (typeof status === 'string' && VALID_GUEST_POST_STATUSES.includes(status));

export const isValidGuestPost = (v: unknown): v is GuestPost =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as GuestPost).id === 'string' &&
  typeof (v as GuestPost).created_at === 'string' &&
  typeof (v as GuestPost).place_name === 'string' &&
  typeof (v as GuestPost).address === 'string' &&
  typeof (v as GuestPost).kakao_place_id === 'string' &&
  typeof (v as GuestPost).content === 'string' &&
  Number.isFinite((v as GuestPost).rating) &&
  Number.isFinite((v as GuestPost).lat) &&
  Number.isFinite((v as GuestPost).lng) &&
  Array.isArray((v as GuestPost).image_urls) &&
  (v as GuestPost).image_urls.every((u) => typeof u === 'string') &&
  Array.isArray((v as GuestPost).tags) &&
  (v as GuestPost).tags.every((t) => typeof t === 'string') &&
  isValidGuestPostStatus((v as GuestPost).status) &&
  (typeof (v as GuestPost).has_visit_record === 'undefined' ||
    typeof (v as GuestPost).has_visit_record === 'boolean');

export const parseGuestPosts = (value: unknown): GuestPost[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(isValidGuestPost);
};

export const loadGuestPosts = (): GuestPost[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_POSTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return parseGuestPosts(parsed);
  } catch {
    return [];
  }
};

export const saveGuestPosts = (posts: GuestPost[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_POSTS_KEY, JSON.stringify(posts));
};

export const addGuestPost = (post: GuestPost): void => {
  if (typeof window === 'undefined') return;
  saveGuestPosts([...loadGuestPosts(), post]);
};

export const removeGuestPost = (id: string): void => {
  if (typeof window === 'undefined') return;
  saveGuestPosts(loadGuestPosts().filter((p) => p.id !== id));
};

export const clearGuestPosts = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_POSTS_KEY);
};
