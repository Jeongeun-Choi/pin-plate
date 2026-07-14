'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Toast, ToastVariant, ToastViewport } from '@pin-plate/ui';

const DEFAULT_TOAST_DURATION = 3200;
const ERROR_TOAST_DURATION = 4800;

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  showSuccessToast: (options: Omit<ToastOptions, 'variant'>) => string;
  showErrorToast: (options: Omit<ToastOptions, 'variant'>) => string;
  dismissToast: (toastId: string) => void;
}

interface Props {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: Props) => {
  const [toastItems, setToastItems] = useState<ToastItem[]>([]);

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const toastSequenceRef = useRef(0);

  const dismissToast = useCallback((toastId: string) => {
    const timer = timersRef.current.get(toastId);

    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(toastId);
    }

    setToastItems((currentToastItems) =>
      currentToastItems.filter((toastItem) => toastItem.id !== toastId),
    );
  }, []);

  const createToastId = useCallback(() => {
    toastSequenceRef.current += 1;

    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `toast-${Date.now()}-${toastSequenceRef.current}`;
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      actionLabel,
      onAction,
      duration,
    }: ToastOptions) => {
      const toastId = createToastId();
      const toastDuration =
        duration ??
        (variant === 'error' ? ERROR_TOAST_DURATION : DEFAULT_TOAST_DURATION);

      setToastItems((currentToastItems) => [
        ...currentToastItems,
        {
          id: toastId,
          title,
          description,
          variant,
          actionLabel,
          onAction,
          duration: toastDuration,
        },
      ]);

      if (toastDuration > 0) {
        const timer = setTimeout(() => dismissToast(toastId), toastDuration);
        timersRef.current.set(toastId, timer);
      }

      return toastId;
    },
    [createToastId, dismissToast],
  );

  const showSuccessToast = useCallback(
    (options: Omit<ToastOptions, 'variant'>) =>
      showToast({ ...options, variant: 'success' }),
    [showToast],
  );

  const showErrorToast = useCallback(
    (options: Omit<ToastOptions, 'variant'>) =>
      showToast({ ...options, variant: 'error' }),
    [showToast],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      showSuccessToast,
      showErrorToast,
      dismissToast,
    }),
    [showToast, showSuccessToast, showErrorToast, dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport>
        {toastItems.map((toastItem) => {
          const handleAction = () => {
            toastItem.onAction?.();
            dismissToast(toastItem.id);
          };

          return (
            <Toast
              key={toastItem.id}
              actionLabel={toastItem.actionLabel}
              description={toastItem.description}
              onAction={toastItem.onAction ? handleAction : undefined}
              onDismiss={() => dismissToast(toastItem.id)}
              title={toastItem.title}
              variant={toastItem.variant}
            />
          );
        })}
      </ToastViewport>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const toastContext = useContext(ToastContext);

  if (!toastContext) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return toastContext;
};
