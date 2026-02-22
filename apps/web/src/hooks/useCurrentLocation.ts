'use client';

import { useState, useCallback } from 'react';

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const fetchLocation = useCallback(() => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      // 0. 캐시된 위치 정보(window.nativeLocation)가 이미 있다면 즉시 반환
      if (window.nativeLocation) {
        const newLoc = {
          lat: window.nativeLocation.coords.latitude,
          lng: window.nativeLocation.coords.longitude,
        };
        setLocation(newLoc);
        return resolve(newLoc);
      }

      // 1. React Native App (WebView) Location Fetching
      if (window.ReactNativeWebView) {
        const handleMessage = (event: MessageEvent) => {
          try {
            const data =
              typeof event.data === 'string'
                ? JSON.parse(event.data)
                : event.data;

            if (data?.type === 'LOCATION') {
              window.nativeLocation = data.payload;
              const newLoc = {
                lat: data.payload.coords.latitude,
                lng: data.payload.coords.longitude,
              };
              setLocation(newLoc);
              resolve(newLoc);

              // Cleanup listeners after successful fetch
              window.removeEventListener('message', handleMessage);
              document.removeEventListener(
                'message',
                handleMessage as unknown as EventListener,
              );
            }
          } catch (e) {
            console.error('Failed to parse location message', e);
          }
        };

        window.addEventListener('message', handleMessage);
        document.addEventListener(
          'message',
          handleMessage as unknown as EventListener,
        );

        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'REQ_LOCATION' }),
        );
      }
      // 2. Web Browser Geolocation
      else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setLocation(newLoc);
            resolve(newLoc);
          },
          (error) => {
            console.error('Error getting location', error);
            reject(error);
          },
        );
      } else {
        reject(new Error('Geolocation is not supported'));
      }
    });
  }, []);

  return { location, fetchLocation };
};
