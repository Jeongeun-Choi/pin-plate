'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import * as styles from './Map.styles.css';
import { usePosts } from '@/features/post/hooks/usePosts';
import type { Post } from '@/features/post/types/post';
import type { Place } from '@/features/post/types/search';
import { calcAverageRating } from '../utils/rating';
import {
  getPinColor,
  getCurrentLocationIcon,
  toDataUrl,
} from '../utils/marker';
import { searchQueryAtom } from '@/app/atoms';
import {
  clickedMapInfoAtom,
  searchPlacesAtom,
  selectedSearchPlaceAtom,
} from '../atoms';
import { getClientPosition } from '../utils/event';
import CustomMarker from './CustomMarker';
import { vars } from '@pin-plate/ui';

const SEOUL_DEFAULT: google.maps.LatLngLiteral = {
  lat: 37.3595704,
  lng: 127.105399,
};

interface MapEffectsProps {
  searchPlaces: Place[];
  currentLocation: { lat: number; lng: number } | null;
}

const MapEffects = ({ searchPlaces, currentLocation }: MapEffectsProps) => {
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
    if (!map || !currentLocation) return;
    map.setCenter(currentLocation);
  }, [map, currentLocation]);

  return null;
};

export const Map = () => {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const router = useRouter();
  const setClickedMapInfo = useSetAtom(clickedMapInfoAtom);
  const setSelectedSearchPlace = useSetAtom(selectedSearchPlaceAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const searchPlaces = useAtomValue(searchPlacesAtom);

  const { data: posts } = usePosts();

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post: Post) =>
      post.place_name?.toLowerCase().includes(query),
    );
  }, [posts, searchQuery]);

  const groupedByPlace = useMemo(() => {
    if (!filteredPosts.length) return [];

    const placeGroups = filteredPosts.reduce<Record<string, Post[]>>(
      (acc, post) => {
        acc[post.kakao_place_id] = acc[post.kakao_place_id]
          ? [...acc[post.kakao_place_id], post]
          : [post];
        return acc;
      },
      {},
    );

    return Object.values(placeGroups).map((placePosts) => {
      const latestPost = [...placePosts].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];
      const averageRating = calcAverageRating(placePosts.map((p) => p.rating));
      return {
        lat: latestPost.lat,
        lng: latestPost.lng,
        averageRating,
        latestPostId: latestPost.id,
      };
    });
  }, [filteredPosts]);

  useEffect(() => {
    const updateLocation = (lat: number, lng: number) => {
      setCurrentLocation({ lat, lng });
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
      });
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
  }, []);

  const initialCenter: google.maps.LatLngLiteral = window.nativeLocation
    ? {
        lat: window.nativeLocation.coords.latitude,
        lng: window.nativeLocation.coords.longitude,
      }
    : SEOUL_DEFAULT;

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
        currentLocation={currentLocation}
      />

      {groupedByPlace.map((group) => {
        const pinWidth = 40;
        const pinHeight = pinWidth * 2;
        const ratingColor = getPinColor(group.averageRating);

        return (
          <AdvancedMarker
            key={group.latestPostId}
            position={{ lat: group.lat, lng: group.lng }}
            onClick={() => router.push(`/post/${group.latestPostId}`)}
          >
            <CustomMarker
              width={pinWidth}
              height={pinHeight}
              color={ratingColor}
              rating={group.averageRating}
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

      {currentLocation && (
        <AdvancedMarker position={currentLocation} zIndex={200}>
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
  );
};
