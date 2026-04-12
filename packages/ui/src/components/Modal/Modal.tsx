'use client';

import { PropsWithChildren, useId, useState } from 'react';
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

  const handleOpenModal = () => {
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (isControlled) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen: open,
        open: handleOpenModal,
        close: handleCloseModal,
        titleId,
        isTitleMounted,
        setIsTitleMounted,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
