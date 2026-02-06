import { ButtonHTMLAttributes, MouseEvent } from 'react';
import { IcDismiss } from '../../icons';
import { useModalContext } from './context';
import * as styles from './styles.css';

interface ModalCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function ModalClose({ onClick, ...props }: ModalCloseProps) {
  const { close } = useModalContext();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    close();
  };

  return (
    <button
      type="button"
      className={styles.closeButton}
      onClick={handleClick}
      aria-label="modal-close"
      {...props}
    >
      <IcDismiss />
    </button>
  );
}
