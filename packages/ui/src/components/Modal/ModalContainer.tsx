import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from './context';
import * as styles from './styles.css';

export default function ModalContainer({ children }: PropsWithChildren) {
  const { isOpen, close } = useModalContext();

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={close}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
