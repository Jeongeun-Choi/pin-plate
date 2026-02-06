import { PropsWithChildren } from 'react';
import * as styles from './styles.css';

export default function ModalHeader({ children }: PropsWithChildren) {
  return <div className={styles.header}>{children}</div>;
}
