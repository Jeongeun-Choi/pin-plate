import { atomWithStorage } from 'jotai/utils';
import {
  clearGuestPosts,
  GUEST_POSTS_KEY,
  loadGuestPosts,
  saveGuestPosts,
} from '../storage/guestPostStorage';
import type { GuestPost } from '../types/guestPost';

interface GuestPostsStorage {
  getItem: (key: string, initialValue: GuestPost[]) => GuestPost[];
  setItem: (key: string, newValue: GuestPost[]) => void;
  removeItem: (key: string) => void;
  subscribe: (
    key: string,
    callback: (value: GuestPost[]) => void,
  ) => (() => void) | undefined;
}

const guestPostsStorage: GuestPostsStorage = {
  getItem: (_key, initialValue) => {
    const guestPosts = loadGuestPosts();

    return guestPosts.length > 0 ? guestPosts : initialValue;
  },
  setItem: (_key, newValue) => {
    saveGuestPosts(newValue);
  },
  removeItem: () => {
    clearGuestPosts();
  },
  subscribe: (key, callback) => {
    if (typeof window === 'undefined') return undefined;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;

      callback(loadGuestPosts());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  },
};

export const guestPostsAtom = atomWithStorage<GuestPost[]>(
  GUEST_POSTS_KEY,
  [],
  guestPostsStorage,
  { getOnInit: true },
);
