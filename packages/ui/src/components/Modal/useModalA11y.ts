'use client';

import { useRef, useEffect } from 'react';
import { useModalContext } from './context';
import { useScrollLock } from './useScrollLock';

export const useModalA11y = () => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { close, titleId, isTitleMounted } = useModalContext();

  useScrollLock();

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [close]);

  return {
    dialogRef,
    a11yProps: {
      role: 'dialog' as const,
      'aria-modal': true as const,
      ...(isTitleMounted ? { 'aria-labelledby': titleId } : {}),
      tabIndex: -1,
    },
  };
};
