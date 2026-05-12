import { atom } from 'jotai';
import { Place } from '@/features/post/types/search';
import type { PlaceStatus } from '@/features/place/types/place';
import type { CuisineId } from '@/features/nearby-search/constants/cuisineTypes';

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

export const currentLocationAtom = atom<{ lat: number; lng: number } | null>(
  null,
);

export const nearbyResultsAtom = atom<Place[]>([]);
export const nearbySearchRadiusKmAtom = atom<number>(1);
export const nearbySearchCuisineAtom = atom<CuisineId[]>(['all']);
export const isNearbySheetOpenAtom = atom<boolean>(false);
