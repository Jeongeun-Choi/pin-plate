'use client';

import {
  PropsWithChildren,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { ModalContext } from './context';

export interface ModalProps extends PropsWithChildren {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Modal({
  children,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: ModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isTitleMounted, setIsTitleMounted] = useState(false);

  const titleId = useId();

  const isControlled =
    externalIsOpen !== undefined && externalOnClose !== undefined;
  const open = isControlled ? externalIsOpen : internalIsOpen;

  const handleOpenModal = useCallback(() => {
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  }, [isControlled]);

  const handleCloseModal = useCallback(() => {
    if (isControlled) {
      externalOnClose?.();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, externalOnClose]);

  const contextValue = useMemo(
    () => ({
      isOpen: open,
      open: handleOpenModal,
      close: handleCloseModal,
      titleId,
      isTitleMounted,
      setIsTitleMounted,
    }),
    [
      open,
      handleOpenModal,
      handleCloseModal,
      titleId,
      isTitleMounted,
      setIsTitleMounted,
    ],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}
