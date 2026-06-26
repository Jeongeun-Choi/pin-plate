import { db } from '../db';

export const localImageRepository = {
  async add(blob: Blob): Promise<string> {
    const id = crypto.randomUUID();
    await db.images.add({
      id,
      blob,
      mime_type: 'image/webp',
      created_at: new Date().toISOString(),
    });
    return id;
  },

  async get(id: string) {
    return db.images.get(id);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await db.images.bulkDelete(ids);
  },
};
