'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { IcCheck, IcDismiss, IcFilledBookmark, IcPlus } from '../../icons';
import * as s from './Toast.css';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  role?: 'status' | 'alert';
}

interface ToastViewportProps {
  children: ReactNode;
}

const variantIconMap = {
  default: IcFilledBookmark,
  success: IcCheck,
  error: IcDismiss,
  info: IcPlus,
} satisfies Record<ToastVariant, ComponentType<SVGProps<SVGSVGElement>>>;

export const ToastViewport = ({ children }: ToastViewportProps) => {
  return (
    <div aria-live="polite" className={s.viewport}>
      {children}
    </div>
  );
};

export const Toast = ({
  title,
  description,
  variant = 'default',
  actionLabel,
  onAction,
  onDismiss,
  role = variant === 'error' ? 'alert' : 'status',
}: ToastProps) => {
  const Icon = variantIconMap[variant];
  const toastClassName =
    variant === 'info' ? `${s.toast} ${s.infoToast}` : s.toast;

  return (
    <div className={toastClassName} role={role}>
      <span className={`${s.rail} ${s.railVariants[variant]}`} />
      <span
        aria-hidden="true"
        className={`${s.iconBubble} ${s.iconVariants[variant]}`}
      >
        <Icon width={20} height={20} />
      </span>
      <span className={s.content}>
        <strong className={s.title}>{title}</strong>
        {description ? (
          <span className={s.description}>{description}</span>
        ) : null}
      </span>
      {actionLabel && onAction ? (
        <button className={s.actionButton} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      {onDismiss ? (
        <button
          aria-label="알림 닫기"
          className={s.dismissButton}
          type="button"
          onClick={onDismiss}
        >
          <IcDismiss aria-hidden="true" width={16} height={16} />
        </button>
      ) : null}
    </div>
  );
};
