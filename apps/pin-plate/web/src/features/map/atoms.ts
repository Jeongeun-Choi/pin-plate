import { atom } from 'jotai';
import { Place } from '@/features/post/types/search';
import type { PlaceStatus } from '@/features/place/types/place';

interface MapClickInfo {
  lat: number;
  lng: number;
  clientX: number;
  clientY: number;
}

export type StatusFilter = PlaceStatus | 'all';

export const clickedMapInfoAtom = atom<MapClickInfo | null>(null);

export const searchPlacesAtom = atom<Place[]>([]);

export const selectedSearchPlaceAtom = atom<Place | null>(null);

export const statusFilterAtom = atom<StatusFilter>('all');
