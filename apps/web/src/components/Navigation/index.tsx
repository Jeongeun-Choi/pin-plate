'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { IcMap, IcPlus, IcUser } from '@pin-plate/ui/icons';
// @ts-expect-error: Vanilla Extract requires .css.ts extension
import * as styles from './Navigation.css.ts';
import { isPostModalOpenAtom } from '@/features/post/atoms';

import { Button } from '@pin-plate/ui';

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);

  const isActive = (path: string) => pathname === path;

  const handleWriteClick = () => {
    setIsPostModalOpen(true);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className={styles.mobileContainer}>
        <button
          className={`${styles.navItem} ${isActive('/') ? styles.activeNavItem : ''}`}
          onClick={() => router.push('/')}
        >
          <IcMap className={styles.icon} color="currentColor" />
          <span className={styles.label}>지도</span>
        </button>

        <button className={`${styles.navItem}`} onClick={handleWriteClick}>
          <IcPlus className={styles.icon} color="currentColor" />
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

      {/* Desktop Navigation */}
      <div className={styles.desktopContainer}>
        <Button
          variant="solid"
          size="lg"
          // className={`${styles.desktopButton} ${isActive('/') ? styles.activeDesktopButton : ''}`}
          onClick={() => router.push('/')}
        >
          <IcMap width={16} height={16} color="currentColor" />
        </Button>

        <Button
          variant="solid"
          size="lg"
          // className={styles.desktopWriteButton}
          onClick={handleWriteClick}
        >
          <IcPlus width={16} height={16} color="currentColor" />
        </Button>

        <Button
          variant="solid"
          size="lg"
          // className={`${styles.desktopButton} ${isActive('/my-page') ? styles.activeDesktopButton : ''}`}
          onClick={() => router.push('/my-page')}
        >
          <IcUser width={16} height={16} color="currentColor" />
        </Button>
      </div>
    </>
  );
};
