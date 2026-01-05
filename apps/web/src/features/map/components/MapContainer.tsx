'use client';

import { Container as MapDiv, NaverMap, useNavermaps } from 'react-naver-maps';
import { mapContainerStyle } from '../styles.css';

const MapContainer = () => {
  return (
    <div className={mapContainerStyle}>
      <MapDiv style={{ width: '100%', height: '100%' }}>
        <NaverMap
          defaultCenter={{ lat: 37.5665, lng: 126.9780 }} // Seoul City Hall
          defaultZoom={15}
        />
      </MapDiv>
    </div>
  );
};

export default MapContainer;
