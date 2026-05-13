import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { guestPostsAtom } from '../atoms/guestPostsAtom';
import * as guestPostStorage from '../storage/guestPostStorage';
import type { GuestPost } from '../types/guestPost';

export const useGuestPosts = () => {
  const [guestPosts, setGuestPosts] = useAtom(guestPostsAtom);

  const addGuestPost = useCallback(
    (post: GuestPost) => {
      guestPostStorage.addGuestPost(post);
      setGuestPosts((prev) => [...prev, post]);
    },
    [setGuestPosts],
  );

  const removeGuestPost = useCallback(
    (id: string) => {
      guestPostStorage.removeGuestPost(id);
      setGuestPosts((prev) => prev.filter((p) => p.id !== id));
    },
    [setGuestPosts],
  );

  const clearGuestPosts = useCallback(() => {
    guestPostStorage.clearGuestPosts();
    setGuestPosts([]);
  }, [setGuestPosts]);

  return {
    guestPosts,
    guestPostCount: guestPosts.length,
    addGuestPost,
    removeGuestPost,
    clearGuestPosts,
  };
};
