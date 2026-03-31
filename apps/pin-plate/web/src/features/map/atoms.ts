import { atom } from 'jotai';
import { KakaoPlace } from '@/features/post/types/search';

interface MapClickInfo {
  lat: number;
  lng: number;
  clientX: number;
  clientY: number;
}

export const clickedMapInfoAtom = atom<MapClickInfo | null>(null);

export const searchPlacesAtom = atom<KakaoPlace[]>([]);

export const selectedSearchPlaceAtom = atom<KakaoPlace | null>(null);
