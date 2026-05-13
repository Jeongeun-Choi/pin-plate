import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { guestPostsAtom } from '../atoms/guestPostsAtom';
import type { GuestPost } from '../types/guestPost';

export const useGuestPosts = () => {
  const [guestPosts, setGuestPosts] = useAtom(guestPostsAtom);

  const addGuestPost = useCallback(
    (post: GuestPost) => {
      setGuestPosts((prev) => [...prev, post]);
    },
    [setGuestPosts],
  );

  const removeGuestPost = useCallback(
    (id: string) => {
      setGuestPosts((prev) => prev.filter((p) => p.id !== id));
    },
    [setGuestPosts],
  );

  const updateGuestPost = useCallback(
    (nextPost: GuestPost) => {
      setGuestPosts((prev) =>
        prev.map((post) => (post.id === nextPost.id ? nextPost : post)),
      );
    },
    [setGuestPosts],
  );

  const clearGuestPosts = useCallback(() => {
    setGuestPosts([]);
  }, [setGuestPosts]);

  return {
    guestPosts,
    guestPostCount: guestPosts.length,
    addGuestPost,
    removeGuestPost,
    updateGuestPost,
    clearGuestPosts,
  };
};
