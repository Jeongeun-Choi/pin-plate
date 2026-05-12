'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  isNearbySheetOpenAtom,
  nearbyResultsAtom,
  nearbySearchRadiusKmAtom,
} from '@/features/map/atoms';
import * as s from './NearbySearchTrigger.css';

export const NearbySearchTrigger = () => {
  const setIsSheetOpen = useSetAtom(isNearbySheetOpenAtom);
  const nearbyResults = useAtomValue(nearbyResultsAtom);
  const radiusKm = useAtomValue(nearbySearchRadiusKmAtom);

  const isActive = nearbyResults.length > 0;
  const radiusLabel = radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm}km`;

  return (
    <button
      type="button"
      className={`${s.trigger} ${isActive ? s.triggerActive : ''}`}
      onClick={() => setIsSheetOpen(true)}
      aria-label={`내 주변 ${radiusLabel} 맛집 탐색`}
    >
      <span aria-hidden="true">▷</span>내 주변 {radiusLabel}
    </button>
  );
};
