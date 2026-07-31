import type { ReactNode } from 'react';
import { GlobalPostModal } from '@/components/GlobalPostModal';
import { Navigation } from '@/components/Navigation';
import { Header } from './components/Header';
import * as styles from './layout.css';

interface Props {
  children: ReactNode;
}

export default function MyPageLayout({ children }: Props) {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.contentWrapper}>{children}</div>
      <Navigation />
      <GlobalPostModal />
    </div>
  );
}
