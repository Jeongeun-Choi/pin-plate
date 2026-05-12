import type { DistanceOption } from '../types';

export const DISTANCE_OPTIONS: DistanceOption[] = [
  { label: '500m', valueKm: 0.5 },
  { label: '1km', valueKm: 1 },
  { label: '3km', valueKm: 3 },
  { label: '5km', valueKm: 5 },
  { label: '10km', valueKm: 10 },
];

export const DEFAULT_DISTANCE_KM = 1;
