'use client';

export const dynamic = 'force-dynamic';

import {
  GuestMyPagePreview,
  MyPageReportSection,
  MyPageHeader,
  MyPageMenu,
  useMyProfile,
} from '@/features/my-page';
import { GuestSavedPostsSection } from '@/features/guest/components/GuestSavedPostsSection';
import * as styles from './page.css';

export default function MyPage() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) {
    return (
      <div className={styles.loadingState} role="status" aria-live="polite">
        마이페이지를 불러오는 중이에요.
      </div>
    );
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
