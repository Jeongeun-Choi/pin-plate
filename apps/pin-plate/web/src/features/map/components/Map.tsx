'use client';

import Script from 'next/script';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import * as styles from './Map.styles.css';
import { usePosts } from '@/features/post/hooks/usePosts';
import {
  getPinColor,
  getPinIcon,
  getSearchPinIcon,
  getCurrentLocationIcon,
} from '../utils/marker';
import { searchQueryAtom } from '@/app/atoms';
import {
  clickedMapInfoAtom,
  searchPlacesAtom,
  selectedSearchPlaceAtom,
} from '../atoms';
import { mapStore } from '../store/MapStore';
import { getClientPosition } from '../utils/event';

export const Map = () => {
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const currentLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const searchMarkersRef = useRef<naver.maps.Marker[]>([]);

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
    return posts.filter((post) =>
      post.place_name?.toLowerCase().includes(query),
    );
  }, [posts, searchQuery]);

  const initializeMap = () => {
    if (!window.naver || !mapRef.current) {
      console.error('initializeMap failed: window.naver or mapRef missing', {
        hasNaver: !!window.naver,
        hasRef: !!mapRef.current,
      });
      return;
    }

    const initialCenter = window.nativeLocation
      ? {
          lat: window.nativeLocation.coords.latitude,
          lng: window.nativeLocation.coords.longitude,
        }
      : undefined;

    const mapInstance = mapStore.init(mapRef.current, {
      center: initialCenter,
    });
    setIsMapReady(true);

    const handleMapClick = (e: {
      coord: naver.maps.LatLng;
      domEvent: MouseEvent | TouchEvent;
    }) => {
      const { clientX, clientY } = getClientPosition(e.domEvent);
      setClickedMapInfo({
        lat: e.coord.y,
        lng: e.coord.x,
        clientX,
        clientY,
      });
    };

    let touchStartPos = { x: 0, y: 0 };

    mapInstance.addListener('click', handleMapClick);
    mapInstance.addListener('touchstart', (e: { domEvent: TouchEvent }) => {
      const touch = e.domEvent.changedTouches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
    });
    mapInstance.addListener(
      'touchend',
      (e: { coord: naver.maps.LatLng; domEvent: TouchEvent }) => {
        const touch = e.domEvent.changedTouches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.x);
        const dy = Math.abs(touch.clientY - touchStartPos.y);
        if (dx < 10 && dy < 10) {
          handleMapClick(e);
        }
      },
    );

    const updateCurrentLocation = (lat: number, lng: number) => {
      const position = new window.naver.maps.LatLng(lat, lng);
      mapInstance.setCenter(position);

      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setPosition(position);
      } else {
        currentLocationMarkerRef.current = new window.naver.maps.Marker({
          position,
          map: mapInstance,
          icon: {
            content: getCurrentLocationIcon(),
            anchor: new window.naver.maps.Point(12, 12),
          },
          zIndex: 200,
        });
      }
    };

    if (window.nativeLocation) {
      updateCurrentLocation(
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
        updateCurrentLocation(
          position.coords.latitude,
          position.coords.longitude,
        );
      });
    }
  };

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      searchMarkersRef.current.forEach((marker) => marker.setMap(null));
      searchMarkersRef.current = [];
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }
      mapStore.destroy();
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    // 이미 스크립트가 로드되어 있는 경우 (페이지 이동 후 복귀 등)
    if (window.naver && mapRef.current && window.naver.maps) {
      initializeMap();
    }
    // initializeMap은 마운트 시 한 번만 실행되어야 하므로 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMapReady || !window.naver) return;

    const map = mapStore.getMap();
    if (!map) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'LOCATION') {
          window.nativeLocation = data.payload;
          const { latitude, longitude } = data.payload.coords;
          const position = new window.naver.maps.LatLng(latitude, longitude);
          map.setCenter(position);

          if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.setPosition(position);
          } else {
            currentLocationMarkerRef.current = new window.naver.maps.Marker({
              position,
              map,
              icon: {
                content: getCurrentLocationIcon(),
                anchor: new window.naver.maps.Point(12, 12),
              },
              zIndex: 200,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

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
  }, [isMapReady]);

  useEffect(() => {
    if (!isMapReady || !window.naver?.maps) return;

    const map = mapStore.getMap();
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    filteredPosts.forEach((post) => {
      const ratingColor = getPinColor(post.rating);
      const pinWidth = 40;
      const pinHeight = pinWidth * 2;
      const markerContent = getPinIcon(
        ratingColor,
        pinWidth,
        pinHeight,
        post.rating,
      );

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(post.lat, post.lng),
        map,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(pinWidth / 2, pinHeight),
        },
      });

      const handlePostMarkerClick = () => {
        router.push(`/post/${post.id}`);
      };

      marker.addListener('click', handlePostMarkerClick);
      marker.addListener('touchend', handlePostMarkerClick);

      markersRef.current.push(marker);
    });
  }, [isMapReady, filteredPosts, router]);

  useEffect(() => {
    if (!isMapReady || !window.naver?.maps) return;

    const map = mapStore.getMap();
    if (!map) return;

    searchMarkersRef.current.forEach((marker) => marker.setMap(null));
    searchMarkersRef.current = [];

    if (searchPlaces.length === 0) return;

    const pinWidth = 32;
    const pinHeight = pinWidth * 2;
    const bounds = new window.naver.maps.LatLngBounds(
      new window.naver.maps.LatLng(90, 180),
      new window.naver.maps.LatLng(-90, -180),
    );

    searchPlaces.forEach((place) => {
      const lat = parseFloat(place.y);
      const lng = parseFloat(place.x);
      const position = new window.naver.maps.LatLng(lat, lng);
      bounds.extend(position);

      const marker = new window.naver.maps.Marker({
        position,
        map,
        icon: {
          content: getSearchPinIcon(pinWidth, pinHeight),
          anchor: new window.naver.maps.Point(pinWidth / 2, pinHeight),
        },
        zIndex: 50,
      });

      const handleSearchMarkerClick = (e: {
        domEvent: MouseEvent | TouchEvent;
      }) => {
        const { clientX, clientY } = getClientPosition(e.domEvent);
        setSelectedSearchPlace(place);
        setClickedMapInfo({
          lat,
          lng,
          clientX,
          clientY,
        });
      };

      marker.addListener('click', handleSearchMarkerClick);
      marker.addListener('touchend', handleSearchMarkerClick);

      searchMarkersRef.current.push(marker);
    });

    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [isMapReady, searchPlaces, setSelectedSearchPlace, setClickedMapInfo]);

  return (
    <>
      <Script
        id="naver-map-script"
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onReady={initializeMap}
      />
      <div id="map" ref={mapRef} className={styles.mapContainer} />
    </>
  );
};
