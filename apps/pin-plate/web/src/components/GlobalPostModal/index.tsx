'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAtom } from 'jotai';
import { isPostModalOpenAtom, prefillPlaceAtom } from '@/features/post/atoms';

const PostModal = dynamic(
  () =>
    import('@/features/post/components/PostModal').then(
      (module) => module.PostModal,
    ),
  {
    ssr: false,
  },
);

export const GlobalPostModal = () => {
  const [isOpen, setIsOpen] = useAtom(isPostModalOpenAtom);
  const [prefillPlace, setPrefillPlace] = useAtom(prefillPlaceAtom);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPrefillPlace(null);
  }, [setIsOpen, setPrefillPlace]);

  if (!isOpen) return null;

  return (
    <PostModal
      isOpen={isOpen}
      onClose={handleClose}
      initialPlace={prefillPlace}
    />
  );
};
