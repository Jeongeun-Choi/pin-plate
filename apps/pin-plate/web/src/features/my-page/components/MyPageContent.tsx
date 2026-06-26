'use client';

import { GuestSavedPostsSection } from '@/features/guest/components/GuestSavedPostsSection';
import { GuestMyPagePreview, MyPageReportSection } from './GuestMyPagePreview';
import { MyPageHeader } from './MyPageHeader';
import { MyPageMenu } from './MyPageMenu';
import { useMyProfile } from '../hooks/useMyProfile';
import * as styles from './MyPageContent.css';
import { Spinner } from '@pin-plate/ui';

export default function MyPageContent() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) {
    return <Spinner />;
  }

  if (!profile) return <GuestMyPagePreview />;

  return (
    <div className={styles.mainContent}>
      <MyPageHeader />

      <MyPageReportSection />

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
