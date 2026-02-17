'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { IcLogout, IcTrash, IcEdit } from '@pin-plate/ui/icons';
import * as styles from './MyPageMenu.css';

interface MenuItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isAccent?: boolean;
}

interface MyPageMenuProps {
  className?: string;
}

export const MyPageMenu = ({ className }: MyPageMenuProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleGoToProfile = () => {
    router.push('/my-page/edit');
  };

  const menuItems: MenuItem[] = [
    {
      label: '프로필 수정',
      onClick: handleGoToProfile,
      icon: <IcEdit width={16} height={16} />,
    },
    {
      label: '로그아웃',
      onClick: handleLogout,
      icon: <IcLogout width={16} height={16} />,
    },
    {
      label: '회원 탈퇴',
      onClick: () => alert('준비 중입니다.'),
      icon: <IcTrash width={16} height={16} />,
      isAccent: true,
    },
  ];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.menuList}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={styles.menuItem}
            onClick={item.onClick}
          >
            {item.icon && (
              <span
                className={`${styles.menuIcon} ${item.isAccent ? styles.menuTextAccent : ''}`}
              >
                {item.icon}
              </span>
            )}
            <span
              className={`${styles.menuText} ${
                item.isAccent ? styles.menuTextAccent : ''
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
