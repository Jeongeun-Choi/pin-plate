'use client';

import { createContext, useContext } from 'react';

interface PopoverContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const PopoverContext = createContext<PopoverContextType | undefined>(
  undefined,
);

export const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover');
  }
  return context;
};
