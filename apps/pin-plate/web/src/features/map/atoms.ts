import { atom } from 'jotai';
import { Place } from '@/features/post/types/search';

interface MapClickInfo {
  lat: number;
  lng: number;
  clientX: number;
  clientY: number;
}

export const clickedMapInfoAtom = atom<MapClickInfo | null>(null);

export const searchPlacesAtom = atom<Place[]>([]);

export const selectedSearchPlaceAtom = atom<Place | null>(null);
