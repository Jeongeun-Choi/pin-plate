'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSetAtom, useAtom } from 'jotai';
import { IcMap, IcPlus, IcUser, IcList } from '@pin-plate/ui/icons';
import * as styles from './Navigation.css';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import { viewModeAtom } from '@/app/atoms';

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  const isActive = (path: string) => pathname === path;

  const handleMapClick = () => {
    if (pathname === '/') {
      setViewMode(viewMode === 'map' ? 'list' : 'map');
    } else {
      router.push('/');
      setViewMode('map');
    }
  };

  const handleWriteClick = () => {
    setIsPostModalOpen(true);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className={styles.mobileContainer}>
        <button
          className={`${styles.navItem} ${isActive('/') ? styles.activeNavItem : ''}`}
          onClick={handleMapClick}
        >
          {viewMode === 'map' ? (
            <IcMap className={styles.icon} color="currentColor" />
          ) : (
            <IcList className={styles.icon} color="currentColor" />
          )}
          <span className={styles.label}>
            {viewMode === 'list' && isActive('/') ? '리스트' : '지도'}
          </span>
        </button>

        <button className={`${styles.navItem}`} onClick={handleWriteClick}>
          <div className={styles.writeIconWrapper}>
            <IcPlus className={styles.writeIcon} color="currentColor" />
          </div>
          <span className={styles.label}>작성</span>
        </button>

        <button
          className={`${styles.navItem} ${isActive('/my-page') ? styles.activeNavItem : ''}`}
          onClick={() => router.push('/my-page')}
        >
          <IcUser className={styles.icon} color="currentColor" />
          <span className={styles.label}>마이</span>
        </button>
      </nav>
    </>
  );
};
