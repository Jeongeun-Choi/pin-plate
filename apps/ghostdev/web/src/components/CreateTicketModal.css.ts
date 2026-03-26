import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(7, 11, 14, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
});

export const modal = style({
  backgroundColor: vars.color.cardBg,
  border: `1px solid ${vars.color.cardBorder}`,
  width: '480px',
  maxWidth: 'calc(100vw - 48px)',
  display: 'flex',
  flexDirection: 'column',
});

export const modalHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.cardBorder}`,
});

export const modalTitle = style({
  fontSize: '13px',
  fontWeight: 700,
  color: vars.color.cyan,
  letterSpacing: '0.1em',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  color: vars.color.textDim,
  cursor: 'pointer',
  fontSize: '16px',
  padding: vars.space.xs,
  lineHeight: 1,
  ':hover': {
    color: vars.color.text,
  },
});

export const modalBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  padding: vars.space.lg,
});

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
});

export const label = style({
  fontSize: '11px',
  color: vars.color.textDim,
  letterSpacing: '0.1em',
  fontWeight: 700,
});

export const input = style({
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.cardBorder}`,
  color: vars.color.text,
  fontSize: '13px',
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontFamily: vars.font.mono,
  outline: 'none',
  ':focus': {
    borderColor: vars.color.cyan,
  },
  '::placeholder': {
    color: vars.color.textDim,
  },
});

export const textarea = style({
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.cardBorder}`,
  color: vars.color.text,
  fontSize: '13px',
  padding: `${vars.space.sm} ${vars.space.md}`,
  fontFamily: vars.font.mono,
  outline: 'none',
  resize: 'vertical',
  minHeight: '80px',
  ':focus': {
    borderColor: vars.color.cyan,
  },
  '::placeholder': {
    color: vars.color.textDim,
  },
});

export const modalFooter = style({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderTop: `1px solid ${vars.color.cardBorder}`,
});

export const submitButton = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${vars.space.sm} ${vars.space.lg}`,
  backgroundColor: vars.color.magenta,
  color: vars.color.bg,
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  cursor: 'pointer',
  transform: 'skewX(-8deg)',
  border: 'none',
  transition: 'opacity 0.15s',
  ':hover': {
    opacity: 0.85,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const submitInner = style({
  transform: 'skewX(8deg)',
});

export const branchPrefixGroup = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xs,
});

export const prefixButton = style({
  background: 'none',
  border: `1px solid ${vars.color.cardBorder}`,
  color: vars.color.textDim,
  fontSize: '11px',
  fontFamily: vars.font.mono,
  fontWeight: 700,
  letterSpacing: '0.05em',
  padding: `${vars.space.xs} ${vars.space.sm}`,
  cursor: 'pointer',
  transition: 'border-color 0.1s, color 0.1s',
  ':hover': {
    borderColor: vars.color.cyan,
    color: vars.color.text,
  },
});

export const prefixButtonActive = style({
  borderColor: vars.color.cyan,
  color: vars.color.cyan,
  backgroundColor: 'rgba(0, 255, 255, 0.06)',
});

export const branchPreview = style({
  fontSize: '11px',
  fontFamily: vars.font.mono,
  color: vars.color.cyan,
  opacity: 0.7,
  marginTop: vars.space.xs,
  letterSpacing: '0.03em',
});
