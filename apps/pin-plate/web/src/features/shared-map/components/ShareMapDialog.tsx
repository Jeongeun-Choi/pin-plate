'use client';

import { useRef } from 'react';
import type { PlaceWithStats } from '@/features/place/types/place';
import { ShareMapWizard } from './ShareMapWizard';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import * as s from './ShareMapDialog.css';

interface Props {
  isOpen: boolean;
  places: PlaceWithStats[];
  ownerId: string | null;
  onClose: () => void;
}

export const ShareMapDialog = ({ isOpen, places, ownerId, onClose }: Props) => {
  const dialogRef = useRef<HTMLElement>(null);

  useDialogFocusTrap({
    isOpen,
    dialogRef,
    onClose,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className={s.overlay} role="presentation">
      <section
        ref={dialogRef}
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="맛집 지도 공유하기"
        tabIndex={-1}
      >
        <ShareMapWizard places={places} ownerId={ownerId} onClose={onClose} />
      </section>
    </div>
  );
};
