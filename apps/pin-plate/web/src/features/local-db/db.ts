import Dexie, { type EntityTable } from 'dexie';
import type { LocalImage, LocalPlace, LocalPost } from './types';

class PinPlateLocalDB extends Dexie {
  images!: EntityTable<LocalImage, 'id'>;
  posts!: EntityTable<LocalPost, 'id'>;
  places!: EntityTable<LocalPlace, 'id'>;

  constructor() {
    super('pin-plate-local');
    this.version(1).stores({
      images: 'id, created_at',
      posts: 'id, place_id, kakao_place_id, created_at',
      places: 'id, kakao_place_id, status, created_at',
    });
  }
}

export const db = new PinPlateLocalDB();
