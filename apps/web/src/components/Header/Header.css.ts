import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  backgroundColor: '#FF9E7D',
  boxShadow:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  '@media': {
    '(min-width: 768px)': {
      padding: '10px 24px',
    },
  },
});

export const leftSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  flex: 1,
});

export const logoContainer = style({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

export const logoText = style({
  fontSize: 20,
  fontWeight: 900,
  color: vars.colors.common.white,
  margin: 0,
  letterSpacing: '-0.05em',
});

export const searchContainer = style({
  position: 'relative',
  display: 'none',
  flex: 1,
  maxWidth: '36rem',
  margin: '0 auto',
  '@media': {
    '(min-width: 768px)': {
      display: 'block',
    },
  },
});

export const searchInput = style({
  width: '100%',
  backgroundColor: vars.colors.common.white,
  borderRadius: 9999,
  padding: '10px 16px 10px 44px',
  fontSize: 14,
  border: 'none',
  outline: 'none',
  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  color: vars.colors.text.primary,
  '::placeholder': {
    color: '#9CA3AF',
  },
});

export const searchIcon = style({
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#9CA3AF',
  pointerEvents: 'none',
});

export const rightSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexShrink: 0,
  marginLeft: 16,
});

export const toggleContainer = style({
  display: 'flex',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: 4,
  borderRadius: 9999,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(4px)',
});

export const toggleButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 16px',
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(255, 255, 255, 0.8)',
  backgroundColor: 'transparent',
  ':hover': {
    color: vars.colors.common.white,
  },
});

export const activeToggleButton = style({
  backgroundColor: vars.colors.common.white,
  color: '#FF9E7D',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  ':hover': {
    color: '#FF9E7D',
  },
});

export const writeButton = style({
  backgroundColor: vars.colors.common.white,
  color: '#FF9E7D',
  padding: '8px 16px',
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  border: 'none',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#FFF7ED',
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

export const writeButtonText = style({
  display: 'none',
  '@media': {
    '(min-width: 640px)': {
      display: 'inline',
    },
  },
});

export const profileIcon = style({
  width: 36,
  height: 36,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.colors.common.white,
  transition: 'background-color 0.2s',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
