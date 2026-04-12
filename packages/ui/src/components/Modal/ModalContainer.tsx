'use client';

import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from './context';
import { useModalA11y } from './useModalA11y';
import * as s from './styles.css';

function ModalContainerInner({ children }: PropsWithChildren) {
  const { close } = useModalContext();
  const { dialogRef, a11yProps } = useModalA11y();

  return createPortal(
    <div className={s.overlay} onClick={close}>
      <div
        ref={dialogRef}
        className={s.container}
        {...a11yProps}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default function ModalContainer({ children }: PropsWithChildren) {
  const { isOpen } = useModalContext();

  if (!isOpen) return null;

  return <ModalContainerInner>{children}</ModalContainerInner>;
}
