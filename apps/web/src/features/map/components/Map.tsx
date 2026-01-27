'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import * as styles from './Map.styles.css';

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);

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
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstance.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const currentPosition = new window.naver.maps.LatLng(
            latitude,
            longitude,
          );
          map.setCenter(currentPosition);
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
