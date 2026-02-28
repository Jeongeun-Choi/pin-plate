'use client';

import { useAtom } from 'jotai';
import { PostModal } from '@/features/post/components/PostModal';
import { isPostModalOpenAtom } from '@/features/post/atoms';

export const GlobalPostModal = () => {
  const [isOpen, setIsOpen] = useAtom(isPostModalOpenAtom);

  if (!isOpen) return null;

  return <PostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};
