'use client';

import { createContext, useContext } from 'react';

interface ModalContextProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  titleId: string;
  isTitleMounted: boolean;
  setIsTitleMounted: (mounted: boolean) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal 컴포넌트 범위 내에서 사용하세요.');
  return context;
};

export { ModalContext, useModalContext };
