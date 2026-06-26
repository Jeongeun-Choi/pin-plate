import { db } from '../db';
import { localPlaceRepository } from '../repositories/localPlaceRepository';
import {
  GUEST_POSTS_KEY,
  parseGuestPosts,
} from '@/features/guest/storage/guestPostStorage';

const MIGRATION_VERSION_KEY = 'local_db_migration_v1';

export async function migrateGuestPostsFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_VERSION_KEY)) return;

  const raw = localStorage.getItem(GUEST_POSTS_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATION_VERSION_KEY, 'done');
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    localStorage.setItem(MIGRATION_VERSION_KEY, 'done');
    return;
  }

  const guestPosts = parseGuestPosts(parsed);

  for (const guestPost of guestPosts) {
    try {
      const existing = await localPlaceRepository.getByKakaoId(
        guestPost.kakao_place_id,
      );

      const now = guestPost.created_at;
      let placeId: string;

      if (existing) {
        placeId = existing.id;
      } else {
        placeId = await localPlaceRepository.addPlace({
          kakao_place_id: guestPost.kakao_place_id,
          place_name: guestPost.place_name,
          address: guestPost.address,
          lat: guestPost.lat,
          lng: guestPost.lng,
          status: guestPost.status ?? 'visited',
          tags: guestPost.tags,
          created_at: now,
          updated_at: now,
        });
      }

      const postId = crypto.randomUUID();
      await db.posts.add({
        id: postId,
        place_id: placeId,
        kakao_place_id: guestPost.kakao_place_id,
        place_name: guestPost.place_name,
        address: guestPost.address,
        lat: guestPost.lat,
        lng: guestPost.lng,
        content: guestPost.content,
        rating: guestPost.rating,
        image_ids: [],
        legacy_image_urls: guestPost.image_urls,
        legacy_image_keys: guestPost.image_keys,
        tags: guestPost.tags,
        created_at: now,
      });
    } catch (error) {
      console.error('Migration failed for guest post:', guestPost.id, error);
    }
  }

  localStorage.removeItem(GUEST_POSTS_KEY);
  localStorage.setItem(MIGRATION_VERSION_KEY, 'done');
}
