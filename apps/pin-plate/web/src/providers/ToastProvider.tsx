'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ToastPosition, ToastVariant } from '@pin-plate/ui/toast';

const DEFAULT_TOAST_DURATION = 3200;
const ERROR_TOAST_DURATION = 4800;

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  isDismissible?: boolean;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
  isDismissible: boolean;
  deduplicationKey: string;
  timerVersion: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  showSuccessToast: (options: Omit<ToastOptions, 'variant'>) => string;
  showErrorToast: (options: Omit<ToastOptions, 'variant'>) => string;
  dismissToast: (toastId: string) => void;
}

interface Props {
  children: ReactNode;
  position?: ToastPosition;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const LazyToastHost = lazy(() =>
  import('./ToastHost').then(({ ToastHost }) => ({ default: ToastHost })),
);

const getToastDeduplicationKey = ({
  title,
  description,
  variant = 'default',
  actionLabel,
}: ToastOptions) =>
  [variant, title, description ?? '', actionLabel ?? ''].join('|');

export const ToastProvider = ({ children, position = 'responsive' }: Props) => {
  const [toastItems, setToastItems] = useState<ToastItem[]>([]);

  const toastItemsRef = useRef<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const toastSequenceRef = useRef(0);

  const updateToastItems = useCallback(
    (updater: (currentToastItems: ToastItem[]) => ToastItem[]) => {
      setToastItems((currentToastItems) => {
        const nextToastItems = updater(currentToastItems);
        toastItemsRef.current = nextToastItems;

        return nextToastItems;
      });
    },
    [],
  );

  const dismissToast = useCallback(
    (toastId: string) => {
      const timer = timersRef.current.get(toastId);

      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(toastId);
      }

      updateToastItems((currentToastItems) =>
        currentToastItems.filter((toastItem) => toastItem.id !== toastId),
      );
    },
    [updateToastItems],
  );

  const scheduleToastDismiss = useCallback(
    (toastId: string, toastDuration: number) => {
      const existingTimer = timersRef.current.get(toastId);

      if (existingTimer) {
        clearTimeout(existingTimer);
        timersRef.current.delete(toastId);
      }

      if (toastDuration > 0) {
        const timer = setTimeout(() => dismissToast(toastId), toastDuration);
        timersRef.current.set(toastId, timer);
      }
    },
    [dismissToast],
  );

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
      isDismissible = false,
    }: ToastOptions) => {
      const toastId = createToastId();
      const deduplicationKey = getToastDeduplicationKey({
        title,
        description,
        variant,
        actionLabel,
      });
      const existingToast = toastItemsRef.current.find(
        (toastItem) => toastItem.deduplicationKey === deduplicationKey,
      );
      const toastDuration =
        duration ??
        (variant === 'error' ? ERROR_TOAST_DURATION : DEFAULT_TOAST_DURATION);

      if (existingToast) {
        updateToastItems((currentToastItems) =>
          currentToastItems.map((toastItem) =>
            toastItem.id === existingToast.id
              ? {
                  ...toastItem,
                  duration: toastDuration,
                  timerVersion: toastItem.timerVersion + 1,
                }
              : toastItem,
          ),
        );

        return existingToast.id;
      }

      updateToastItems((currentToastItems) => [
        ...currentToastItems,
        {
          id: toastId,
          title,
          description,
          variant,
          actionLabel,
          onAction,
          duration: toastDuration,
          isDismissible,
          deduplicationKey,
          timerVersion: 0,
        },
      ]);

      return toastId;
    },
    [createToastId, updateToastItems],
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
      {toastItems.length > 0 ? (
        <Suspense fallback={null}>
          <LazyToastHost
            dismissToast={dismissToast}
            position={position}
            scheduleToastDismiss={scheduleToastDismiss}
            toastItems={toastItems}
          />
        </Suspense>
      ) : null}
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
