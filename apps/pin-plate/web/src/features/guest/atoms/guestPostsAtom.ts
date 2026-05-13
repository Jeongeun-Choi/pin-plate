import { atom } from 'jotai';
import type { GuestPost } from '../types/guestPost';

export const guestPostsAtom = atom<GuestPost[]>([]);
