'use client';

import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from './context';
import { useModalA11y } from './useModalA11y';
import * as s from './styles.css';

function FullScreenModalContainerInner({ children }: PropsWithChildren) {
  const { close } = useModalContext();
  const { dialogRef, a11yProps } = useModalA11y();

  return createPortal(
    <div className={s.overlay} onClick={close}>
      <div
        ref={dialogRef}
        className={s.fullScreenContainer}
        {...a11yProps}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default function FullScreenModalContainer({
  children,
}: PropsWithChildren) {
  const { isOpen } = useModalContext();

  if (!isOpen) return null;

  return <FullScreenModalContainerInner>{children}</FullScreenModalContainerInner>;
}
