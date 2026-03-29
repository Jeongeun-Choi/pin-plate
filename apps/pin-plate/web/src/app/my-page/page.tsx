// 'use client';

export const dynamic = 'force-dynamic';

import { MyPageHeader, MyPageMenu } from '@/features/my-page';
import * as styles from './page.css';

export default function MyPage() {
  return (
    <div className={styles.mainContent}>
      <MyPageHeader />

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
