'use client';

import { ReactNode } from 'react';
import { usePopover } from './context';
import * as styles from './Popover.css';

interface ItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const PopoverItem = ({ children, onClick, className }: ItemProps) => {
  const { close } = usePopover();
  const handleClick = () => {
    onClick?.();
    close();
  };
  return (
    <button
      className={`${styles.item} ${className || ''}`}
      onClick={handleClick}
      type="button"
    >
      {children}
    </button>
  );
};
