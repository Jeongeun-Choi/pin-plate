'use client';

import { NavermapsProvider } from 'react-naver-maps';
import { ReactNode } from 'react';

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  console.log('Naver Map Client ID:', clientId);

  if (!clientId) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100dvh', 
        backgroundColor: '#f8d7da', 
        color: '#721c24',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h3>Naver Map Client ID Not Found</h3>
          <p>Please check your <code>.env.local</code> file.</p>
        </div>
      </div>
    );
  }

  return (
    <NavermapsProvider ncpClientId={clientId}>
      {children}
    </NavermapsProvider>
  );
};
