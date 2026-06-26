import { db } from '../db';
import { getObjectUrl } from '../utils/objectUrlCache';
import type {
  CreateLocalPlaceInput,
  LocalPlace,
  LocalPlaceWithStats,
  UpdateLocalPlaceInput,
} from '../types';

export const localPlaceRepository = {
  async getAll(): Promise<LocalPlace[]> {
    return db.places.orderBy('created_at').reverse().toArray();
  },

  async getById(id: string): Promise<LocalPlace | undefined> {
    return db.places.get(id);
  },

  async getByKakaoId(kakaoPlaceId: string): Promise<LocalPlace | undefined> {
    return db.places.where('kakao_place_id').equals(kakaoPlaceId).first();
  },

  async getWithStats(): Promise<LocalPlaceWithStats[]> {
    const [places, allPosts] = await Promise.all([
      db.places.orderBy('created_at').reverse().toArray(),
      db.posts.toArray(),
    ]);

    return Promise.all(
      places.map(async (place) => {
        const placePosts = allPosts
          .filter((p) => p.place_id === place.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

        const postsWithUrls = await Promise.all(
          placePosts.map(async (post) => {
            const localUrls = (
              await Promise.all(post.image_ids.map(getObjectUrl))
            ).filter((url): url is string => url !== null);

            const imageUrls = [...localUrls, ...(post.legacy_image_urls ?? [])];

            return {
              id: post.id,
              rating: post.rating,
              image_urls: imageUrls,
              created_at: post.created_at,
            };
          }),
        );

        const visitCount = placePosts.filter(
          (p) => p.content || p.rating > 0,
        ).length;
        const visitedPosts = postsWithUrls.filter(
          (p) =>
            p.rating > 0 || placePosts.find((lp) => lp.id === p.id)?.content,
        );
        const avgRating =
          visitedPosts.length > 0
            ? visitedPosts.reduce((sum, p) => sum + p.rating, 0) /
              visitedPosts.length
            : null;

        return {
          ...place,
          posts: postsWithUrls,
          visit_count: visitCount,
          avg_rating: avgRating,
          last_visited_at: postsWithUrls[0]?.created_at ?? null,
          first_image: postsWithUrls[0]?.image_urls[0] ?? null,
        };
      }),
    );
  },

  async addPlace(input: CreateLocalPlaceInput): Promise<string> {
    const id = crypto.randomUUID();
    await db.places.add({ id, ...input });
    return id;
  },

  async updatePlace(id: string, updates: UpdateLocalPlaceInput): Promise<void> {
    await db.places.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  },

  async deletePlace(id: string): Promise<void> {
    const posts = await db.posts.where('place_id').equals(id).toArray();
    const imageIds = posts.flatMap((p) => p.image_ids);

    await db.transaction('rw', db.places, db.posts, db.images, async () => {
      await db.images.bulkDelete(imageIds);
      await db.posts.where('place_id').equals(id).delete();
      await db.places.delete(id);
    });
  },
};
