'use client';

import { NavermapsProvider } from 'react-naver-maps';
import { ReactNode } from 'react';

export const MapProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NavermapsProvider
      ncpClientId={process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || 'placeholder-id'}
    >
      {children}
    </NavermapsProvider>
  );
};
