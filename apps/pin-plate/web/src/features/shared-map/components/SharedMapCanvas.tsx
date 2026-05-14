'use client';

import { useEffect, useMemo } from 'react';
import {
  AdvancedMarker,
  Map as GoogleMap,
  useMap,
} from '@vis.gl/react-google-maps';
import CustomMarker from '@/features/map/components/CustomMarker';
import { getStatusPinColor } from '@/features/map/utils/marker';
import type { SharedMapPlace } from '../types/sharedMap';
import * as s from './SharedMapView.css';

const SEOUL_FALLBACK = {
  lat: 37.5665,
  lng: 126.978,
};

interface Props {
  places: SharedMapPlace[];
}

const isValidSharedMapPlace = (place: SharedMapPlace): boolean =>
  Number.isFinite(place.lat) && Number.isFinite(place.lng);

interface SharedMapBoundsProps {
  places: SharedMapPlace[];
}

const SharedMapBounds = ({ places }: SharedMapBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || places.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      bounds.extend({ lat: place.lat, lng: place.lng });
    });
    map.fitBounds(bounds, 64);
  }, [map, places]);

  return null;
};

export const SharedMapCanvas = ({ places }: Props) => {
  const validPlaces = useMemo(
    () => places.filter(isValidSharedMapPlace),
    [places],
  );
  const firstPlace = validPlaces[0];
  const center = firstPlace
    ? { lat: firstPlace.lat, lng: firstPlace.lng }
    : SEOUL_FALLBACK;
  const pinWidth = 40;
  const pinHeight = pinWidth * 2;

  return (
    <GoogleMap
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
      defaultCenter={center}
      defaultZoom={places.length > 1 ? 13 : 15}
      disableDefaultUI
      clickableIcons={false}
      className={s.map}
    >
      <SharedMapBounds places={validPlaces} />

      {validPlaces.map((place) => (
        <AdvancedMarker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
        >
          <CustomMarker
            width={pinWidth}
            height={pinHeight}
            color={getStatusPinColor(place.status, place.avg_rating)}
            icon={place.status === 'wish' ? 'bookmark' : undefined}
            rating={
              place.status !== 'wish' && place.avg_rating != null
                ? Math.round(place.avg_rating * 10) / 10
                : undefined
            }
          />
        </AdvancedMarker>
      ))}
    </GoogleMap>
  );
};
