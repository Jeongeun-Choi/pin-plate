'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useModalContext } from './context';
import * as s from './styles.css';

export default function ModalTitle({ children }: PropsWithChildren) {
  const { titleId, setIsTitleMounted } = useModalContext();

  useEffect(() => {
    setIsTitleMounted(true);
    return () => setIsTitleMounted(false);
  }, [setIsTitleMounted]);

  return (
    <h2 id={titleId} className={s.title}>
      {children}
    </h2>
  );
}
