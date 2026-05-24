'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import * as styles from './Map.styles.css';
import { usePlaces } from '@/features/place/hooks/usePlaces';
import type { PlaceWithStats } from '@/features/place/types/place';
import type { Place } from '@/features/post/types/search';
import { useGuestPosts } from '@/features/guest/hooks/useGuestPosts';
import type { GuestPost } from '@/features/guest/types/guestPost';
import {
  getStatusPinColor,
  getCurrentLocationIcon,
  toDataUrl,
} from '../utils/marker';
import { searchQueryAtom } from '@/app/atoms';
import {
  clickedMapInfoAtom,
  currentLocationAtom,
  nearbyResultsAtom,
  searchPlacesAtom,
  selectedSearchPlaceAtom,
  statusFilterAtom,
} from '../atoms';
import { getClientPosition } from '../utils/event';
import CustomMarker from './CustomMarker';
import { Spinner, vars } from '@pin-plate/ui';

const SEOUL_DEFAULT: google.maps.LatLngLiteral = {
  lat: 37.3595704,
  lng: 127.105399,
};

const GUEST_PLACE_USER_ID = 'guest';

const toGuestPlace = (guestPost: GuestPost): PlaceWithStats => ({
  id: guestPost.id,
  user_id: GUEST_PLACE_USER_ID,
  kakao_place_id: guestPost.kakao_place_id,
  place_name: guestPost.place_name,
  address: guestPost.address,
  lat: guestPost.lat,
  lng: guestPost.lng,
  status: guestPost.status ?? 'visited',
  tags: guestPost.tags,
  created_at: guestPost.created_at,
  updated_at: guestPost.created_at,
  posts:
    guestPost.has_visit_record === false
      ? []
      : [
          {
            id: 0,
            rating: guestPost.rating,
            image_urls: guestPost.image_urls,
            created_at: guestPost.created_at,
          },
        ],
  visit_count: guestPost.has_visit_record === false ? 0 : 1,
  avg_rating: guestPost.has_visit_record === false ? null : guestPost.rating,
  last_visited_at:
    guestPost.has_visit_record === false ? null : guestPost.created_at,
  first_image: guestPost.image_urls[0] ?? null,
});

interface MapEffectsProps {
  searchPlaces: Place[];
  nearbyPlaces: Place[];
  currentLocation: { lat: number; lng: number } | null;
}

const MapEffects = ({
  searchPlaces,
  nearbyPlaces,
  currentLocation,
}: MapEffectsProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || searchPlaces.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    searchPlaces.forEach((place) => {
      bounds.extend({ lat: parseFloat(place.y), lng: parseFloat(place.x) });
    });
    map.fitBounds(bounds, 60);
  }, [map, searchPlaces]);

  useEffect(() => {
    if (!map || nearbyPlaces.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    nearbyPlaces.forEach((place) => {
      const lat = parseFloat(place.y);
      const lng = parseFloat(place.x);
      if (isFinite(lat) && isFinite(lng)) {
        bounds.extend({ lat, lng });
      }
    });
    map.fitBounds(bounds, 80);
  }, [map, nearbyPlaces]);

  useEffect(() => {
    if (!map || !currentLocation) return;
    map.setCenter(currentLocation);
  }, [map, currentLocation]);

  return null;
};

export const Map = () => {
  const [localCurrentLocation, setLocalCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [initialCenter, setInitialCenter] =
    useState<google.maps.LatLngLiteral | null>(() =>
      window.nativeLocation
        ? {
            lat: window.nativeLocation.coords.latitude,
            lng: window.nativeLocation.coords.longitude,
          }
        : null,
    );

  const router = useRouter();
  const setClickedMapInfo = useSetAtom(clickedMapInfoAtom);
  const setSelectedSearchPlace = useSetAtom(selectedSearchPlaceAtom);
  const setCurrentLocation = useSetAtom(currentLocationAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const searchPlaces = useAtomValue(searchPlacesAtom);
  const nearbyPlaces = useAtomValue(nearbyResultsAtom);
  const statusFilter = useAtomValue(statusFilterAtom);

  const { data: places } = usePlaces();
  const { guestPosts } = useGuestPosts();

  const guestPlaces = useMemo(
    () =>
      guestPosts
        .filter(
          (post) => Number.isFinite(post.lat) && Number.isFinite(post.lng),
        )
        .map(toGuestPlace),
    [guestPosts],
  );

  const searchFilteredPlaces = useMemo(() => {
    const savedPlaces = places ?? [];
    const displayPlaces = [...savedPlaces, ...guestPlaces];
    const query = searchQuery.trim().toLowerCase();
    return displayPlaces.filter(
      (place: PlaceWithStats) =>
        !query || place.place_name.toLowerCase().includes(query),
    );
  }, [guestPlaces, places, searchQuery]);

  const visiblePlaces = useMemo(() => {
    return searchFilteredPlaces.filter(
      (place) => statusFilter === 'all' || place.status === statusFilter,
    );
  }, [searchFilteredPlaces, statusFilter]);

  useEffect(() => {
    const updateLocation = (lat: number, lng: number) => {
      const loc = { lat, lng };
      setLocalCurrentLocation(loc);
      setInitialCenter(loc);
      setCurrentLocation(loc);
    };

    const setFallbackLocation = () => {
      setInitialCenter(
        (currentInitialCenter) => currentInitialCenter ?? SEOUL_DEFAULT,
      );
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'LOCATION') {
          window.nativeLocation = data.payload;
          updateLocation(
            data.payload.coords.latitude,
            data.payload.coords.longitude,
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (window.nativeLocation) {
      updateLocation(
        window.nativeLocation.coords.latitude,
        window.nativeLocation.coords.longitude,
      );
    }

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'REQ_LOCATION' }),
      );
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      }, setFallbackLocation);
    } else {
      setFallbackLocation();
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener(
      'message',
      handleMessage as unknown as EventListener,
    );

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener(
        'message',
        handleMessage as unknown as EventListener,
      );
    };
  }, [setCurrentLocation]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!e.detail.latLng || !e.domEvent) return;
    const { clientX, clientY } = getClientPosition(
      e.domEvent as MouseEvent | TouchEvent,
    );
    setClickedMapInfo({
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng,
      clientX,
      clientY,
    });
  };

  return (
    <div className={styles.mapWrapper}>
      {initialCenter ? (
        <GoogleMap
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
          defaultCenter={initialCenter}
          defaultZoom={15}
          disableDefaultUI
          clickableIcons={false}
          className={styles.mapContainer}
          onClick={handleMapClick}
        >
          <MapEffects
            searchPlaces={searchPlaces}
            nearbyPlaces={nearbyPlaces}
            currentLocation={localCurrentLocation}
          />

          {visiblePlaces.map((place) => {
            const pinWidth = 40;
            const pinHeight = pinWidth * 2;
            const pinColor = getStatusPinColor(place.status, place.avg_rating);
            const visitedRatingTextColor =
              place.status === 'visited' && place.avg_rating != null
                ? vars.colors.primary.textSoft
                : undefined;
            const latestPostId = [...place.posts]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .at(0)?.id;

            const handlePlaceMarkerClick = (e: google.maps.MapMouseEvent) => {
              const isGuestPlace = place.user_id === GUEST_PLACE_USER_ID;

              if (isGuestPlace) {
                router.push(`/post/${place.id}`);
                return;
              }

              if (latestPostId && !isGuestPlace) {
                router.push(`/post/${latestPostId}`);
                return;
              }
              if (!e.domEvent) return;
              const { clientX, clientY } = getClientPosition(
                e.domEvent as MouseEvent | TouchEvent,
              );
              setSelectedSearchPlace({
                id: place.kakao_place_id,
                place_name: place.place_name,
                category_name: '',
                category_group_code: '',
                category_group_name: '',
                phone: '',
                address_name: place.address,
                road_address_name: place.address,
                x: String(place.lng),
                y: String(place.lat),
                place_url: '',
                distance: '',
              });
              setClickedMapInfo({
                lat: place.lat,
                lng: place.lng,
                clientX,
                clientY,
              });
            };

            return (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={handlePlaceMarkerClick}
              >
                <CustomMarker
                  width={pinWidth}
                  height={pinHeight}
                  color={pinColor}
                  icon={place.status === 'wish' ? 'bookmark' : undefined}
                  ratingTextColor={visitedRatingTextColor}
                  rating={
                    place.status !== 'wish' && place.avg_rating != null
                      ? Math.round(place.avg_rating * 10) / 10
                      : undefined
                  }
                />
              </AdvancedMarker>
            );
          })}

          {searchPlaces.map((place) => {
            const pinWidth = 32;
            const pinHeight = pinWidth * 2;
            const lat = parseFloat(place.y);
            const lng = parseFloat(place.x);

            const handleSearchMarkerClick = (e: google.maps.MapMouseEvent) => {
              if (!e.domEvent) return;
              const { clientX, clientY } = getClientPosition(
                e.domEvent as MouseEvent | TouchEvent,
              );
              setSelectedSearchPlace(place);
              setClickedMapInfo({ lat, lng, clientX, clientY });
            };

            return (
              <AdvancedMarker
                key={place.id}
                position={{ lat, lng }}
                zIndex={50}
                onClick={handleSearchMarkerClick}
              >
                <CustomMarker
                  width={pinWidth}
                  height={pinHeight}
                  color={vars.colors.pin[0]}
                />
              </AdvancedMarker>
            );
          })}

          {nearbyPlaces.map((place) => {
            const pinWidth = 32;
            const pinHeight = pinWidth * 2;
            const lat = parseFloat(place.y);
            const lng = parseFloat(place.x);
            if (!isFinite(lat) || !isFinite(lng)) return null;

            const handleNearbyMarkerClick = (e: google.maps.MapMouseEvent) => {
              if (!e.domEvent) return;
              const { clientX, clientY } = getClientPosition(
                e.domEvent as MouseEvent | TouchEvent,
              );
              setSelectedSearchPlace(place);
              setClickedMapInfo({ lat, lng, clientX, clientY });
            };

            return (
              <AdvancedMarker
                key={`nearby-${place.id}`}
                position={{ lat, lng }}
                zIndex={40}
                onClick={handleNearbyMarkerClick}
              >
                <CustomMarker
                  width={pinWidth}
                  height={pinHeight}
                  color={vars.colors.pin[0]}
                />
              </AdvancedMarker>
            );
          })}

          {localCurrentLocation && (
            <AdvancedMarker position={localCurrentLocation} zIndex={200}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={toDataUrl(getCurrentLocationIcon())}
                width={24}
                height={24}
                alt=""
              />
            </AdvancedMarker>
          )}
        </GoogleMap>
      ) : (
        <div className={styles.mapContainer}>
          <Spinner />
        </div>
      )}
    </div>
  );
};
