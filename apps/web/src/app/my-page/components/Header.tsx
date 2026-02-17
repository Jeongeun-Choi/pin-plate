'use client';

import { useRouter, usePathname } from 'next/navigation';
import { IcArrowLeft } from '@pin-plate/ui/icons';
import * as styles from './Header.css';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    router.back();
  };

  const getTitle = () => {
    if (pathname === '/my-page/edit') {
      return '프로필 수정';
    }
    return '마이페이지';
  };

  return (
    <header className={styles.header}>
      <div className={styles.backButton} onClick={handleBack}>
        <IcArrowLeft width={24} height={24} />
      </div>
      <h1 className={styles.title}>{getTitle()}</h1>
    </header>
  );
};
