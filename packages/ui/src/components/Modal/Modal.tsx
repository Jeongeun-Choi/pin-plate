import { PropsWithChildren, useContext, useState } from 'react';
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

  // Use external state if provided, otherwise internal
  const isControlled =
    externalIsOpen !== undefined && externalOnClose !== undefined;
  const open = isControlled ? externalIsOpen : internalIsOpen;

  const handleOpenModal = () => {
    if (isControlled) {
      // Controlled mode: Parent handles opening
      // Provide a warning or no-op if this is called in controlled mode?
      // Or maybe we treat 'open' as request to open.
    } else {
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
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
