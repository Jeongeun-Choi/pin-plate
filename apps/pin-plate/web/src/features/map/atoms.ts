import { atom } from 'jotai';

interface MapClickInfo {
  lat: number;
  lng: number;
  clientX: number;
  clientY: number;
}

export const clickedMapInfoAtom = atom<MapClickInfo | null>(null);
