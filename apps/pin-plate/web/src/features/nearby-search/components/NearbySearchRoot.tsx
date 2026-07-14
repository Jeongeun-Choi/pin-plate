'use client';

import { useAtom } from 'jotai';
import { isNearbySheetOpenAtom } from '@/features/map/atoms';
import { StatusFilterChips } from '@/features/place/components/StatusFilterChips';
import { NearbySearchSheet } from './NearbySearchSheet';
import { NearbySearchTrigger } from './NearbySearchTrigger';
import * as s from './NearbySearchRoot.css';

export const NearbySearchRoot = () => {
  const [isSheetOpen, setIsSheetOpen] = useAtom(isNearbySheetOpenAtom);

  return (
    <>
      <div className={s.filterRow} data-place-detail-sheet-boundary>
        <NearbySearchTrigger />
        <span className={s.divider} aria-hidden="true" />
        <div className={s.chipsWrapper}>
          <StatusFilterChips />
        </div>
      </div>
      {isSheetOpen && (
        <NearbySearchSheet onClose={() => setIsSheetOpen(false)} />
      )}
    </>
  );
};
