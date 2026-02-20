import { atom } from 'jotai';

export type ViewMode = 'map' | 'list';

export const viewModeAtom = atom<ViewMode>('map');
