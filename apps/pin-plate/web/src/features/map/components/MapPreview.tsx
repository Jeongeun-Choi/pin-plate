'use client';

import { memo } from 'react';
import { Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import * as styles from './MapPreview.styles.css';
import { vars } from '@pin-plate/ui';
import CustomMarker from './CustomMarker';

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
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
        center={position}
        defaultZoom={16}
        disableDefaultUI
        clickableIcons={false}
        gestureHandling="none"
        className={styles.map}
      >
        <AdvancedMarker position={position}>
          <CustomMarker
            width={pinWidth}
            height={pinHeight}
            color={vars.colors.pin[500]}
          />
        </AdvancedMarker>
      </GoogleMap>
    </div>
  );
});

MapPreview.displayName = 'MapPreview';
