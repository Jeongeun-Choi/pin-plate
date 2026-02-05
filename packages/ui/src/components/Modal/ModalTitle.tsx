import { PropsWithChildren } from 'react';

import * as styles from './styles.css';

export default function ModalTitle({ children }: PropsWithChildren) {
  return <h2 className={styles.headerTitle}>{children}</h2>;
}
