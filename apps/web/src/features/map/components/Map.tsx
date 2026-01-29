'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import * as styles from './Map.styles.css';
import { usePosts } from '@/features/post/hooks/usePosts';
import { getMarkerIcon } from '../utils/marker';

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const { data: posts } = usePosts();

  const initializeMap = () => {
    if (window.naver && mapRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 15,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
        zoomControl: false,
        mapTypeControl: false,
      };
      const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const currentPosition = new window.naver.maps.LatLng(
            latitude,
            longitude,
          );
          mapInstance.setCenter(currentPosition);
        });
      }
    }
  };

  useEffect(() => {
    // 이미 스크립트가 로드되어 있는 경우 (페이지 이동 후 복귀 등)
    if (window.naver && mapRef.current) {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (map && posts) {
      posts.forEach((post) => {
        const markerContent = getMarkerIcon(); // Example custom color (Tomato-ish)

        new naver.maps.Marker({
          position: new naver.maps.LatLng(post.lat, post.lng),
          map: map,
          icon: {
            content: markerContent,
            size: new naver.maps.Size(34, 42),
            anchor: new naver.maps.Point(17, 42),
          },
        });
      });
    }
  }, [map, posts]);

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
