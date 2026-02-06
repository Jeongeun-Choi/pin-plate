'use client';

import { ReactNode } from 'react';
import { usePopover } from './context';
import * as styles from './Popover.css';

interface TriggerProps {
  children: ReactNode;
  className?: string; // Allow overriding styles if needed
}

export const PopoverTrigger = ({ children, className }: TriggerProps) => {
  const { toggle } = usePopover();
  return (
    <button
      className={`${styles.trigger} ${className || ''}`}
      onClick={toggle}
      type="button"
    >
      {children}
    </button>
  );
};
