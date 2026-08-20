'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { IcMap, IcPlus, IcUser } from '@pin-plate/ui/icons';
import { viewModeAtom } from '@/app/atoms';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import * as styles from './Navigation.css';

const MobileNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);
  const setViewMode = useSetAtom(viewModeAtom);

  const isHomeActive = pathname === '/';
  const isMyPageActive =
    pathname === '/my-page' || pathname.startsWith('/my-page/');

  const handleHomeClick = () => {
    if (pathname !== '/') {
      router.push('/');
    }
    setViewMode('map');
  };

  const handleWriteClick = () => {
    setIsPostModalOpen(true);
  };

  const handleMyPageClick = () => {
    router.push('/my-page');
  };

  return (
    <nav className={styles.mobileContainer}>
      <button
        className={`${styles.navItem} ${isHomeActive ? styles.activeNavItem : ''}`}
        onClick={handleHomeClick}
        aria-current={isHomeActive ? 'page' : undefined}
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
      </button>

      <button
        className={`${styles.navItem} ${isMyPageActive ? styles.activeNavItem : ''}`}
        onClick={handleMyPageClick}
        aria-current={isMyPageActive ? 'page' : undefined}
        aria-label="마이페이지"
      >
        <span className={styles.navContent}>
          <IcUser className={styles.icon} color="currentColor" />
          <span className={styles.label}>마이</span>
        </span>
      </button>
    </nav>
  );
};

export default MobileNavigation;
