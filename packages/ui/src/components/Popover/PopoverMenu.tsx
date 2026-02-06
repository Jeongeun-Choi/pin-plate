'use client';

import { ReactNode } from 'react';
import { usePopover } from './context';
import * as styles from './Popover.css';

interface MenuProps {
  children: ReactNode;
  className?: string;
}

export const PopoverMenu = ({ children, className }: MenuProps) => {
  const { isOpen } = usePopover();
  if (!isOpen) return null;
  return <div className={`${styles.menu} ${className || ''}`}>{children}</div>;
};
