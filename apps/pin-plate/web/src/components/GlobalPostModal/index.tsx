'use client';

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { PostModal } from '@/features/post/components/PostModal';
import { isPostModalOpenAtom, prefillPlaceAtom } from '@/features/post/atoms';

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
