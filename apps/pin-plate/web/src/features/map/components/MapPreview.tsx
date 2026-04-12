'use client';

import Script from 'next/script';
import { memo, useEffect, useRef, useCallback } from 'react';
import * as styles from './MapPreview.styles.css';
import { getPinIcon } from '../utils/marker';
import { vars } from '@pin-plate/ui';

interface MapPreviewProps {
  lat: number;
  lng: number;
}

export const MapPreview = memo(({ lat, lng }: MapPreviewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const initializeMap = useCallback(() => {
    if (window.naver && mapRef.current) {
      const position = new window.naver.maps.LatLng(lat, lng);
      const mapOptions = {
        center: position,
        zoom: 16,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
        zoomControl: false,
        mapTypeControl: false,
        draggable: false,
        scrollWheel: false,
        disableDoubleClickZoom: true,
        disableDoubleTapZoom: true,
        disableTwoFingerTapZoom: true,
      };
      const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions);

      // Add marker
      const pinWidth = 40;
      const pinHeight = pinWidth * 2;
      const markerContent = getPinIcon(
        vars.colors.pin[500],
        pinWidth,
        pinHeight,
      );
      new window.naver.maps.Marker({
        position: position,
        map: mapInstance,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(pinWidth / 2, pinHeight),
        },
      });
    }
  }, [lat, lng]);

  useEffect(() => {
    if (window.naver && mapRef.current) {
      initializeMap();
    }
  }, [initializeMap]);

  return (
    <div className={styles.container}>
      <Script
        id="naver-map-script"
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        onReady={initializeMap}
      />
      <div id="map-preview" ref={mapRef} className={styles.map} />
    </div>
  );
});

MapPreview.displayName = 'MapPreview';
