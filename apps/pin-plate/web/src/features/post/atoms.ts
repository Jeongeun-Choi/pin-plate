import { atom } from 'jotai';
import { Place } from './types/search';

export const isPostModalOpenAtom = atom(false);
export const prefillPlaceAtom = atom<Place | null>(null);
