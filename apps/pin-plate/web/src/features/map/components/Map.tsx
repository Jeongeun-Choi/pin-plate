'use client';

import Script from 'next/script';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import * as styles from './Map.styles.css';
import { usePosts } from '@/features/post/hooks/usePosts';
import { getPinColor, getPinIcon, getCurrentLocationIcon } from '../utils/marker';
import { searchQueryAtom } from '@/app/atoms';
import { clickedMapInfoAtom } from '../atoms';

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);

  const currentLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const setClickedMapInfo = useSetAtom(clickedMapInfoAtom);
  const searchQuery = useAtomValue(searchQueryAtom);

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
    if (window.naver && mapRef.current) {
      const initialCenter = window.nativeLocation
        ? new window.naver.maps.LatLng(
            window.nativeLocation.coords.latitude,
            window.nativeLocation.coords.longitude,
          )
        : new window.naver.maps.LatLng(37.3595704, 127.105399);

      const mapOptions = {
        center: initialCenter,
        zoom: 15,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
        zoomControl: false,
        mapTypeControl: false,
      };
      const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);

      mapInstance.addListener(
        'click',
        (e: { coord: naver.maps.LatLng; domEvent: MouseEvent }) => {
          setClickedMapInfo({
            lat: e.coord.y,
            lng: e.coord.x,
            clientX: e.domEvent.clientX,
            clientY: e.domEvent.clientY,
          });
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
    } else {
      console.error('initializeMap failed: window.naver or mapRef missing', {
        hasNaver: !!window.naver,
        hasRef: !!mapRef.current,
      });
    }
  };

  useEffect(() => {
    if (!map || !window.naver) return;

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
  }, [map]);

  useEffect(() => {
    // 이미 스크립트가 로드되어 있는 경우 (페이지 이동 후 복귀 등)
    if (window.naver && mapRef.current && window.naver.maps) {
      initializeMap();
    }
  }, []);

  const markersRef = useRef<naver.maps.Marker[]>([]);

  useEffect(() => {
    if (map && filteredPosts && window.naver && window.naver.maps) {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
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
          map: map,
          icon: {
            content: markerContent,
            // size: new window.naver.maps.Size(pinWidth, pinHeight),
            anchor: new window.naver.maps.Point(pinWidth / 2, pinHeight),
          },
        });

        marker.addListener('click', (e: { domEvent: MouseEvent }) => {
          setClickedMapInfo({
            lat: post.lat,
            lng: post.lng,
            clientX: e.domEvent.clientX,
            clientY: e.domEvent.clientY,
          });
        });

        markersRef.current.push(marker);
      });
    }
  }, [map, filteredPosts, setClickedMapInfo]);

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
