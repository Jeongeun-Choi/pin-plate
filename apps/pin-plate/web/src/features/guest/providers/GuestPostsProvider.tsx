'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { guestPostsAtom } from '../atoms/guestPostsAtom';
import { loadGuestPosts } from '../storage/guestPostStorage';

interface Props {
  children: React.ReactNode;
}

export const GuestPostsProvider = ({ children }: Props) => {
  const setGuestPosts = useSetAtom(guestPostsAtom);

  useEffect(() => {
    setGuestPosts(loadGuestPosts());
  }, [setGuestPosts]);

  return <>{children}</>;
};
