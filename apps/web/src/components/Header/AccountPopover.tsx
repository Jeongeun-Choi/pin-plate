import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { IcSettings, IcLogout, IcUser } from '@pin-plate/ui/icons';
import * as styles from './AccountPopover.css';

interface AccountPopoverProps {
  onClose: () => void;
  anchorElement?: HTMLElement | null;
}

export const AccountPopover = ({
  onClose,
  anchorElement,
}: AccountPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const updatePosition = () => {
      if (anchorElement) {
        const rect = anchorElement.getBoundingClientRect();
        setPositionStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
          left: 'auto',
          bottom: 'auto',
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorElement]);

  const handleMyPageClick = () => {
    onClose();
    router.push('/my-page');
  };

  const handleLogoutClick = () => {
    onClose();
    // TODO: implement actual logout logic
    alert('로그아웃 기능은 아직 구현되지 않았습니다.');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const content = (
    <div
      className={styles.popoverContainer}
      ref={popoverRef}
      style={positionStyle}
    >
      <div className={styles.topSection}>
        <div className={styles.avatar}>
          <IcUser width={32} height={32} color="currentColor" />
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>사용자</p>
          <p className={styles.userEmail}>demo@pinplate.com</p>
        </div>
      </div>
      <div className={styles.bottomSection}>
        <button className={styles.menuItem} onClick={handleMyPageClick}>
          <div className={styles.standardMenuIcon}>
            <IcSettings width={20} height={20} color="currentColor" />
          </div>
          <span className={styles.standardMenuText}>마이페이지</span>
        </button>
        <button className={styles.menuItem} onClick={handleLogoutClick}>
          <div className={styles.logoutMenuIcon}>
            <IcLogout width={20} height={20} color="currentColor" />
          </div>
          <span className={styles.logoutMenuText}>로그아웃</span>
        </button>
      </div>
    </div>
  );

  return anchorElement ? createPortal(content, document.body) : content;
};
