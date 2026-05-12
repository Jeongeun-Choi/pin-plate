'use client';

import { useAtom } from 'jotai';
import { isNearbySheetOpenAtom } from '@/features/map/atoms';
import { NearbySearchTrigger } from './NearbySearchTrigger';
import { NearbySearchSheet } from './NearbySearchSheet';

export const NearbySearchRoot = () => {
  const [isSheetOpen, setIsSheetOpen] = useAtom(isNearbySheetOpenAtom);

  return (
    <>
      <NearbySearchTrigger />
      {isSheetOpen && (
        <NearbySearchSheet onClose={() => setIsSheetOpen(false)} />
      )}
    </>
  );
};
