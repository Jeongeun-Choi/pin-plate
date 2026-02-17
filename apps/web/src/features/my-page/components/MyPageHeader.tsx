'use client';

import Image from 'next/image';
import { useMyProfile } from '@/features/my-page/hooks/useMyProfile';
import * as styles from './MyPageHeader.css';

export const MyPageHeader = () => {
  const { data: profile } = useMyProfile();

  const nickname = profile?.nickname;
  const email = profile?.email;
  const imageUrl = profile?.image_url;

  return (
    <div className={styles.container}>
      <div className={styles.avatarContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile"
            fill
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.placeholderAvatar}>
            {nickname?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      <div className={styles.infoContainer}>
        <h1 className={styles.nickname}>{nickname || '사용자'}</h1>
        <p className={styles.email}>{email || '이메일 없음'}</p>
      </div>
    </div>
  );
};
