import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

const toastEnter = keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 8px, 0)',
  },
  to: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

export const viewport = style({
  position: 'fixed',
  zIndex: vars.zIndex.toast,
  display: 'flex',
  width: `min(calc(100vw - ${vars.spacing[8]}), 420px)`,
  flexDirection: 'column',
  gap: vars.spacing[3],
  pointerEvents: 'none',
});

export const viewportPositions = styleVariants({
  responsive: {
    left: '50%',
    bottom: `calc(env(safe-area-inset-bottom) + ${vars.spacing[20]})`,
    transform: 'translateX(-50%)',
    '@media': {
      'screen and (min-width: 768px)': {
        top: vars.spacing[6],
        bottom: 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '420px',
      },
    },
  },
  'top-right': {
    top: vars.spacing[6],
    right: vars.spacing[6],
  },
  'top-center': {
    top: vars.spacing[6],
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'bottom-center': {
    left: '50%',
    bottom: `calc(env(safe-area-inset-bottom) + ${vars.spacing[20]})`,
    transform: 'translateX(-50%)',
  },
});

export const toast = style({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: `${vars.spacing[12]} minmax(0, 1fr) auto auto`,
  alignItems: 'center',
  gap: vars.spacing[3],
  minHeight: '76px',
  padding: `${vars.spacing[4]} ${vars.spacing[5]}`,
  overflow: 'hidden',
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius['2xl'],
  backgroundColor: vars.colors.background.surface,
  boxShadow: vars.boxShadow.float,
  color: vars.colors.text.primary,
  pointerEvents: 'auto',
  animation: `${toastEnter} 180ms ease-out`,
  '@media': {
    'screen and (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const iconBubble = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: vars.spacing[12],
  height: vars.spacing[12],
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.primary.hover,
});

export const iconVariants = styleVariants({
  default: {
    color: vars.colors.primary.hover,
  },
  success: {
    color: vars.colors.status.success,
  },
  error: {
    color: vars.colors.brand.secondary,
  },
  info: {
    color: vars.colors.primary.hover,
  },
});

export const content = style({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: vars.spacing[1],
});

export const title = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
  letterSpacing: 0,
});

export const description = style({
  margin: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.regular,
  lineHeight: vars.lineHeight.body,
  letterSpacing: 0,
});

export const actionButton = style({
  minWidth: '64px',
  minHeight: '44px',
  padding: `${vars.spacing[2]} ${vars.spacing[4]}`,
  border: 0,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  cursor: 'pointer',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
  transition: 'background-color 140ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.hover,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.hover}`,
      outlineOffset: vars.spacing[1],
    },
  },
});

export const dismissButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  padding: 0,
  border: 0,
  borderRadius: vars.borderRadius.full,
  backgroundColor: 'transparent',
  color: vars.colors.text.sub,
  cursor: 'pointer',
  transition: 'background-color 140ms ease-out, color 140ms ease-out',
  selectors: {
    '&:hover': {
      backgroundColor: vars.colors.primary.light,
      color: vars.colors.text.primary,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.hover}`,
      outlineOffset: vars.spacing[1],
    },
  },
});

export const infoToast = style({
  backgroundColor: vars.colors.primary.light,
});
