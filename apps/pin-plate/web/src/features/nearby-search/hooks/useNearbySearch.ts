'use client';

import { useMutation } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import type { Place } from '@/features/post/types/search';
import {
  currentLocationAtom,
  nearbyResultsAtom,
  nearbySearchCuisineAtom,
  nearbySearchRadiusKmAtom,
} from '@/features/map/atoms';

const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  radiusKm: number,
  cuisine: string,
): Promise<Place[]> => {
  const radiusMeters = Math.round(radiusKm * 1000);
  const res = await fetch(
    `/api/search/nearby?x=${lng}&y=${lat}&radius=${radiusMeters}&cuisine=${cuisine}`,
  );
  if (!res.ok) throw new Error('fetch_failed');
  const data: unknown = await res.json();
  return (data as { documents: Place[] }).documents ?? [];
};

export const useNearbySearch = () => {
  const currentLocation = useAtomValue(currentLocationAtom);
  const radiusKm = useAtomValue(nearbySearchRadiusKmAtom);
  const cuisine = useAtomValue(nearbySearchCuisineAtom);
  const setNearbyResults = useSetAtom(nearbyResultsAtom);

  return useMutation({
    mutationFn: async () => {
      if (!currentLocation) throw new Error('location_required');
      return fetchNearbyPlaces(
        currentLocation.lat,
        currentLocation.lng,
        radiusKm,
        cuisine,
      );
    },
    onSuccess: (places) => {
      setNearbyResults(places);
    },
  });
};
