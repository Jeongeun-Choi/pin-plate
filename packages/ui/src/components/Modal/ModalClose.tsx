'use client';

import { ButtonHTMLAttributes, MouseEvent } from 'react';
import { IcDismiss } from '../../icons';
import { useModalContext } from './context';
import * as s from './styles.css';

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
      className={s.closeButton}
      onClick={handleClick}
      aria-label="닫기"
      {...props}
    >
      <IcDismiss />
    </button>
  );
}
