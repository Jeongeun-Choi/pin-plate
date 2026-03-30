import { atom } from 'jotai';
import { KakaoPlace } from './types/search';

export const isPostModalOpenAtom = atom(false);
export const prefillPlaceAtom = atom<KakaoPlace | null>(null);
