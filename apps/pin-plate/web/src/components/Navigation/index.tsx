'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MobileNavigation = dynamic(() => import('./MobileNavigation'), {
  ssr: false,
});

export const Navigation = () => {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia('(max-width: 767px)');
    const syncMobileViewport = () => {
      setIsMobileViewport(mobileMediaQuery.matches);
    };

    syncMobileViewport();
    mobileMediaQuery.addEventListener('change', syncMobileViewport);

    return () => {
      mobileMediaQuery.removeEventListener('change', syncMobileViewport);
    };
  }, []);

  return isMobileViewport ? <MobileNavigation /> : null;
};
