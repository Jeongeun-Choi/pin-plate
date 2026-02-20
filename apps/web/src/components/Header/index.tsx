import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom, useAtom } from 'jotai';
import { IcSearch, IcMap, IcSort, IcPlus, IcUser } from '@pin-plate/ui/icons';
import { viewModeAtom } from '@/app/atoms';
import * as styles from './Header.css';
import { isPostModalOpenAtom } from '@/features/post/atoms';
import { AccountPopover } from './AccountPopover';

export const Header = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen((prev) => !prev);
  };

  return (
    <header className={styles.container}>
      {/* Left: Logo & Search */}
      <div className={styles.leftSection}>
        <div className={styles.logoContainer} onClick={() => router.push('/')}>
          <p className={styles.logoText}>Pin-Plate</p>
        </div>

        <div className={styles.searchContainer}>
          <IcSearch className={styles.searchIcon} width={20} height={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="장소명, 지역, 태그 검색..."
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Toggle (Middle previously, now Right Section) */}
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'map' ? styles.activeToggleButton : ''}`}
            onClick={() => setViewMode('map')}
          >
            <IcMap width={16} height={16} />
            <span>지도</span>
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'list' ? styles.activeToggleButton : ''}`}
            onClick={() => setViewMode('list')}
          >
            <IcSort width={16} height={16} />
            <span>리스트</span>
          </button>
        </div>

        {/* Write Button */}
        <button
          className={styles.writeButton}
          onClick={() => setIsPostModalOpen(true)}
        >
          <IcPlus width={20} height={20} color="currentColor" />
          <span>작성하기</span>
        </button>

        {/* Profile Icon */}
        <div style={{ position: 'relative' }}>
          <div className={styles.profileIcon} onClick={togglePopover}>
            <IcUser width={20} height={20} color="currentColor" />
          </div>
          {isPopoverOpen && (
            <AccountPopover onClose={() => setIsPopoverOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
};
