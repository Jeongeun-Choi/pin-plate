'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Toast, ToastViewport } from '@pin-plate/ui/toast';
import type { ToastPosition } from '@pin-plate/ui/toast';
import type { ToastItem } from './ToastProvider';

interface Props {
  toastItems: ToastItem[];
  position: ToastPosition;
  dismissToast: (toastId: string) => void;
  scheduleToastDismiss: (toastId: string, toastDuration: number) => void;
}

export const ToastHost = ({
  toastItems,
  position,
  dismissToast,
  scheduleToastDismiss,
}: Props) => {
  const timerVersionByToastIdRef = useRef<Map<string, number>>(new Map());

  const handleDismissToast = useCallback(
    (toastId: string) => {
      dismissToast(toastId);
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeToastIds = new Set(toastItems.map((toastItem) => toastItem.id));

    timerVersionByToastIdRef.current.forEach((_, toastId) => {
      if (!activeToastIds.has(toastId)) {
        timerVersionByToastIdRef.current.delete(toastId);
      }
    });

    toastItems.forEach((toastItem) => {
      const currentTimerVersion = timerVersionByToastIdRef.current.get(
        toastItem.id,
      );

      if (currentTimerVersion === toastItem.timerVersion) {
        return;
      }

      timerVersionByToastIdRef.current.set(
        toastItem.id,
        toastItem.timerVersion,
      );
      scheduleToastDismiss(toastItem.id, toastItem.duration);
    });
  }, [scheduleToastDismiss, toastItems]);

  return (
    <ToastViewport position={position}>
      {toastItems.map((toastItem) => {
        const handleAction = () => {
          toastItem.onAction?.();
          handleDismissToast(toastItem.id);
        };

        return (
          <Toast
            key={toastItem.id}
            actionLabel={toastItem.actionLabel}
            description={toastItem.description}
            onAction={toastItem.onAction ? handleAction : undefined}
            onDismiss={() => handleDismissToast(toastItem.id)}
            isDismissible={toastItem.isDismissible}
            title={toastItem.title}
            variant={toastItem.variant}
          />
        );
      })}
    </ToastViewport>
  );
};
