'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { MyPageHeader, MyPageMenu, useMyProfile } from '@/features/my-page';
import { GuestSavedPostsSection } from '@/features/guest/components/GuestSavedPostsSection';
import * as styles from './page.css';

const GuestMyPage = () => {
  const router = useRouter();

  return (
    <div className={styles.mainContent}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>
          로그인이 필요합니다
        </p>
        <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
          로그인하고 나만의 맛집을 기록해보세요.
        </p>
        <button
          type="button"
          onClick={() => router.push('/sign-in')}
          style={{
            padding: '12px 32px',
            borderRadius: '9999px',
            backgroundColor: '#FF9E7D',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          로그인하기
        </button>
        <button
          type="button"
          onClick={() => router.push('/sign-up')}
          style={{
            padding: '12px 32px',
            borderRadius: '9999px',
            backgroundColor: '#fff4e6',
            color: '#FF9E7D',
            fontSize: '15px',
            fontWeight: 700,
            border: '2px solid #FF9E7D',
            cursor: 'pointer',
          }}
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default function MyPage() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) return null;
  if (!profile) return <GuestMyPage />;

  return (
    <div className={styles.mainContent}>
      <MyPageHeader />

      <GuestSavedPostsSection userId={profile.id} />

      <MyPageMenu />

      <div className={styles.footerMessage}>
        <p className={styles.footerText}>
          Pin-Plate
          <span className={styles.footerTextLight}>
            는 여러분의 소중한 맛집 기억을 안전하게 보관합니다. 모든 리뷰는
            비공개이며, 오직 본인만 볼 수 있습니다.
          </span>
        </p>
      </div>
    </div>
  );
}
