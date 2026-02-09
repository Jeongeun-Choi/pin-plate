'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import * as styles from './Map.styles.css';
import { useRouter } from 'next/navigation';
import { usePosts } from '@/features/post/hooks/usePosts';
import { getMarkerIcon } from '../utils/marker';

export const Map = () => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const { data: posts } = usePosts();

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

      const updateCenter = (lat: number, lng: number) => {
        const currentPosition = new window.naver.maps.LatLng(lat, lng);
        mapInstance.setCenter(currentPosition);
      };

      if (window.nativeLocation) {
        updateCenter(
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
          updateCenter(position.coords.latitude, position.coords.longitude);
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
          const currentPosition = new window.naver.maps.LatLng(
            data.payload.coords.latitude,
            data.payload.coords.longitude,
          );
          map.setCenter(currentPosition);
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
    if (map && posts && window.naver && window.naver.maps) {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      posts.forEach((post) => {
        const markerContent = getMarkerIcon();

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(post.lat, post.lng),
          map: map,
          icon: {
            content: markerContent,
            size: new window.naver.maps.Size(34, 42),
            anchor: new window.naver.maps.Point(17, 42),
          },
        });

        marker.addListener('click', () => {
          router.push(`/post/${post.id}`);
        });

        markersRef.current.push(marker);
      });
    }
  }, [map, posts, router]);

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
