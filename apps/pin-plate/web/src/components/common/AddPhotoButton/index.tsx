import { ButtonHTMLAttributes } from 'react';
import { IcPicture } from '@pin-plate/ui';
import * as styles from './styles.css';

type AddPhotoButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function AddPhotoButton(props: AddPhotoButtonProps) {
  return (
    <button type="button" className={styles.container} {...props}>
      <div className={styles.icon}>
        <IcPicture width={28} height={28} />
      </div>
      <span className={styles.text}>사진 추가</span>
    </button>
  );
}
