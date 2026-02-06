'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import * as styles from './Popover.css';
import { PopoverContext } from './context';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverMenu } from './PopoverMenu';
import { PopoverItem } from './PopoverItem';

interface PopoverProps {
  children: ReactNode;
  className?: string;
}

const PopoverMain = ({ children, className }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <PopoverContext.Provider value={{ isOpen, toggle, close }}>
      <div
        className={`${styles.container} ${className || ''}`}
        ref={containerRef}
      >
        {isOpen && (
          <div
            className={styles.backdrop}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          />
        )}
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const Popover = Object.assign(PopoverMain, {
  Trigger: PopoverTrigger,
  Menu: PopoverMenu,
  Item: PopoverItem,
});
