import { db } from '../db';
import { getObjectUrl } from '../utils/objectUrlCache';
import type {
  CreateLocalPostInput,
  LocalPost,
  LocalPostWithUrls,
  UpdateLocalPostInput,
} from '../types';

export const localPostRepository = {
  async getAll(): Promise<LocalPost[]> {
    return db.posts.orderBy('created_at').reverse().toArray();
  },

  async getById(id: string): Promise<LocalPost | undefined> {
    return db.posts.get(id);
  },

  async getByIdWithUrls(id: string): Promise<LocalPostWithUrls | null> {
    const post = await db.posts.get(id);
    if (!post) return null;

    const localUrls = (
      await Promise.all(post.image_ids.map(getObjectUrl))
    ).filter((url): url is string => url !== null);

    return {
      ...post,
      image_urls: [...localUrls, ...(post.legacy_image_urls ?? [])],
    };
  },

  async getByPlaceId(placeId: string): Promise<LocalPost[]> {
    return db.posts.where('place_id').equals(placeId).toArray();
  },

  async addPost(input: CreateLocalPostInput): Promise<string> {
    const id = crypto.randomUUID();
    await db.posts.add({ id, ...input });
    return id;
  },

  async updatePost(id: string, updates: UpdateLocalPostInput): Promise<void> {
    await db.posts.update(id, updates);
  },

  async deletePost(id: string): Promise<void> {
    const post = await db.posts.get(id);
    if (!post) return;

    await db.transaction('rw', db.posts, db.images, async () => {
      await db.images.bulkDelete(post.image_ids);
      await db.posts.delete(id);
    });
  },

  async clearAllLocalData(): Promise<void> {
    const allPosts = await db.posts.toArray();
    const imageIds = allPosts.flatMap((p) => p.image_ids);

    await db.transaction('rw', db.posts, db.images, db.places, async () => {
      if (imageIds.length > 0) {
        await db.images.bulkDelete(imageIds);
      }
      await db.posts.clear();
      await db.places.clear();
    });
  },
};
