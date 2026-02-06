import { ButtonHTMLAttributes } from 'react';
import * as styles from './styles.css';

interface AddPhotoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function AddPhotoButton(props: AddPhotoButtonProps) {
  return (
    <button type="button" className={styles.container} {...props}>
      <div className={styles.icon}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.6667 9.33333H20.6933C20.32 8.52 19.5333 8 18.6667 8H13.3333C12.4667 8 11.68 8.52 11.3067 9.33333H9.33333C7.86667 9.33333 6.66667 10.5333 6.66667 12V22.6667C6.66667 24.1333 7.86667 25.3333 9.33333 25.3333H22.6667C24.1333 25.3333 25.3333 24.1333 25.3333 22.6667V12C25.3333 10.5333 24.1333 9.33333 22.6667 9.33333ZM16 22.6667C13.7867 22.6667 12 20.88 12 18.6667C12 16.4533 13.7867 14.6667 16 14.6667C18.2133 14.6667 20 16.4533 20 18.6667C20 20.88 18.2133 22.6667 16 22.6667Z"
            fill="#8B6F5C"
          />
        </svg>
      </div>
      <span className={styles.text}>사진 추가</span>
    </button>
  );
}
