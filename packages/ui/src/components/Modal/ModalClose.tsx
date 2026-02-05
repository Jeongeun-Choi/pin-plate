import { IcDismiss } from '../../icons';
import { useModalContext } from './context';
import * as styles from './styles.css';

export default function ModalClose() {
  const { close } = useModalContext();

  return (
    <button
      type="button"
      className={styles.closeButton}
      onClick={close}
      aria-label="modal-close"
    >
      <IcDismiss />
    </button>
  );
}
