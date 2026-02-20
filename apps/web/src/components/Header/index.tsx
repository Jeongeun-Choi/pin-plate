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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const setIsPostModalOpen = useSetAtom(isPostModalOpenAtom);

  const togglePopover = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (isPopoverOpen) {
      setIsPopoverOpen(false);
      setAnchorEl(null);
    } else {
      setIsPopoverOpen(true);
      setAnchorEl(e.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
    setAnchorEl(null);
  };

  return (
    <header className={styles.container}>
      {/* Left: Logo & Search */}
      <div className={styles.leftSection}>
        <div className={styles.logoContainer} onClick={() => router.push('/')}>
          <h1 className={styles.logoText}>Pin-Plate</h1>
        </div>

        <div className={styles.searchContainer}>
          <IcSearch className={styles.searchIcon} width={16} height={16} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="장소명, 지역, 태그 검색..."
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Toggle */}
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'map' ? styles.activeToggleButton : ''}`}
            onClick={() => setViewMode('map')}
          >
            <IcMap width={14} height={14} color="currentColor" />
            <span>지도</span>
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'list' ? styles.activeToggleButton : ''}`}
            onClick={() => setViewMode('list')}
          >
            <IcSort width={14} height={14} color="currentColor" />
            <span>리스트</span>
          </button>
        </div>

        {/* Write Button */}
        <button
          className={styles.writeButton}
          onClick={() => setIsPostModalOpen(true)}
        >
          <IcPlus width={16} height={16} color="currentColor" />
          <span className={styles.writeButtonText}>작성하기</span>
        </button>

        {/* Profile Icon */}
        <div style={{ position: 'relative' }}>
          <div className={styles.profileIcon} onClick={togglePopover}>
            <IcUser width={20} height={20} color="currentColor" />
          </div>
          {isPopoverOpen && (
            <AccountPopover
              onClose={handlePopoverClose}
              anchorElement={anchorEl}
            />
          )}
        </div>
      </div>
    </header>
  );
};
