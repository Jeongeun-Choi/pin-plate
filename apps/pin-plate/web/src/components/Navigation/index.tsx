'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { IcMap, IcPlus, IcUser } from '@pin-plate/ui/icons';
import * as styles from './Navigation.css';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import { viewModeAtom } from '@/app/atoms';

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);
  const setViewMode = useSetAtom(viewModeAtom);

  const isActive = (path: string) => pathname === path;

  const handleHomeClick = () => {
    if (pathname !== '/') {
      router.push('/');
    }
    setViewMode('map');
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
          onClick={handleHomeClick}
          aria-label="홈으로 이동"
        >
          <span className={styles.navContent}>
            <IcMap className={styles.icon} color="currentColor" />
            <span className={styles.label}>홈</span>
          </span>
        </button>

        <button
          className={`${styles.navItem} ${styles.writeNavItem}`}
          onClick={handleWriteClick}
          aria-label="작성하기"
        >
          <span className={styles.writeIconWrapper}>
            <IcPlus className={styles.writeIcon} color="currentColor" />
          </span>
          <span className={styles.label}>작성</span>
        </button>

        <button
          className={`${styles.navItem} ${isActive('/my-page') ? styles.activeNavItem : ''}`}
          onClick={() => router.push('/my-page')}
          aria-label="마이페이지"
        >
          <span className={styles.navContent}>
            <IcUser className={styles.icon} color="currentColor" />
            <span className={styles.label}>마이</span>
          </span>
        </button>
      </nav>
    </>
  );
};
