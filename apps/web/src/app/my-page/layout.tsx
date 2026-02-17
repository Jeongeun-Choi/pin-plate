import { ReactNode } from 'react';
import { Header } from './components/Header';
import * as styles from './layout.css';

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
}
