'use client';

import { memo } from 'react';
import { Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import * as styles from './MapPreview.styles.css';
import { getPinIcon, toDataUrl } from '../utils/marker';
import { vars } from '@pin-plate/ui';

interface Props {
  lat: number;
  lng: number;
}

export const MapPreview = memo(({ lat, lng }: Props) => {
  const position = { lat, lng };
  const pinWidth = 40;
  const pinHeight = pinWidth * 2;

  return (
    <div className={styles.container}>
      <GoogleMap
        defaultCenter={position}
        defaultZoom={16}
        disableDefaultUI
        clickableIcons={false}
        gestureHandling="none"
        className={styles.map}
      >
        <AdvancedMarker position={position}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toDataUrl(
              getPinIcon(vars.colors.pin[500], pinWidth, pinHeight),
            )}
            width={pinWidth}
            height={pinHeight}
            alt=""
          />
        </AdvancedMarker>
      </GoogleMap>
    </div>
  );
});

MapPreview.displayName = 'MapPreview';
