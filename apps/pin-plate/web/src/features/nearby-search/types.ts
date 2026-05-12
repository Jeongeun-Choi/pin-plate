import type { CuisineId } from './constants/cuisineTypes';

export interface DistanceOption {
  label: string;
  valueKm: number;
}

export interface CuisineOption {
  id: CuisineId;
  label: string;
}
