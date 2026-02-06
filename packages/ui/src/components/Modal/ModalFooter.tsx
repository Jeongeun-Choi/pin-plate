import { PropsWithChildren } from 'react';

import * as styles from './styles.css';

export default function ModalFooter({ children }: PropsWithChildren) {
  return <div className={styles.footer}>{children}</div>;
}
