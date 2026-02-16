import { PropsWithChildren } from 'react';

import * as styles from './styles.css';

export default function ModalTitle({ children }: PropsWithChildren) {
  return <h2 className={styles.title}>{children}</h2>;
}
