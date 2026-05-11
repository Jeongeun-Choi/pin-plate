'use client';

import { useAtom } from 'jotai';
import { statusFilterAtom } from '@/features/map/atoms';
import { PLACE_STATUS_FILTER_OPTIONS } from '../constants/status';
import * as s from './StatusFilterChips.css';

export const StatusFilterChips = () => {
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);

  return (
    <>
      {PLACE_STATUS_FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`${s.chip} ${statusFilter === opt.value ? s.activeChip : ''}`}
          onClick={() => setStatusFilter(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </>
  );
};
