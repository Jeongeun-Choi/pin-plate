"use client";

import { useEffect, useRef } from "react";
import { mapContainerStyle } from "../styles.css";

const MapContainer = () => {
  const mapRef = useRef<naver.maps.Map | null>(null);

  useEffect(() => {
    // 1. 네이버 지도 스크립트 로드 여부 확인
    if (!window.naver || !window.naver.maps) {
      console.warn("Naver Maps script not loaded");
      return;
    }

    // 2. 이미 지도가 생성되었다면 중복 생성 방지
    if (mapRef.current) return;

    // 3. 지도 초기화
    const mapOptions = {
      center: new naver.maps.LatLng(37.3595704, 127.105399),
      zoom: 15,
    };

    mapRef.current = new naver.maps.Map("map", mapOptions);
  }, []);

  return <div id="map" className={mapContainerStyle}></div>;
};

export default MapContainer;
