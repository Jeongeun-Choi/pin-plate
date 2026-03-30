'use client';

import { useAtom } from 'jotai';
import { PostModal } from '@/features/post/components/PostModal';
import { isPostModalOpenAtom, prefillPlaceAtom } from '@/features/post/atoms';

export const GlobalPostModal = () => {
  const [isOpen, setIsOpen] = useAtom(isPostModalOpenAtom);
  const [prefillPlace, setPrefillPlace] = useAtom(prefillPlaceAtom);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    setPrefillPlace(null);
  };

  return (
    <PostModal
      isOpen={isOpen}
      onClose={handleClose}
      initialPlace={prefillPlace}
    />
  );
};
