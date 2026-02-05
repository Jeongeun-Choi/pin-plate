import { PropsWithChildren } from 'react';
import * as styles from './styles.css';

export default function ModalBody({ children }: PropsWithChildren) {
  return <div className={styles.content}>{children}</div>;
}
