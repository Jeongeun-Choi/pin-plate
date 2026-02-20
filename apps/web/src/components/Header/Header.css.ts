import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const container = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 68,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  backgroundColor: vars.colors.primary.default,
  zIndex: vars.zIndex.header,
  borderBottom: '4px solid rgba(0, 0, 0, 0.05)',
  boxShadow: '0px 4px 6px 0px rgba(0,0,0,0.1), 0px 2px 4px 0px rgba(0,0,0,0.1)',
});

export const leftSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flex: 1,
  minWidth: 0, // flex item overflow 방지
});

export const logoContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  flexShrink: 0, // 로고 크기 유지
});

export const logoIcon = style({
  width: 40,
  height: 40,
  flexShrink: 0,
});

export const logoText = style({
  fontSize: 20,
  fontWeight: 900,
  color: vars.colors.common.white,
  fontFamily: '"Inter", sans-serif',
  letterSpacing: '-0.95px',
});

export const searchContainer = style({
  position: 'relative',
  flex: 1, // 남은 공간 차지
  minWidth: 200, // 너무 작아지지 않도록 최소 너비 설정
  height: 48,
  marginRight: '16px',
});

export const searchInput = style({
  width: '100%',
  height: '100%',
  borderRadius: 20,
  border: '2px solid rgba(255, 255, 255, 0.5)',
  backgroundColor: vars.colors.common.white,
  padding: '0 48px',
  fontSize: 14,
  fontWeight: vars.fontWeight.medium,
  color: 'rgba(26, 26, 26, 0.5)',
  boxShadow:
    '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
  outline: 'none',
  transition: 'all 0.2s ease',
  '::placeholder': {
    color: 'rgba(26, 26, 26, 0.5)',
  },
  ':focus': {
    border: `2px solid ${vars.colors.common.white}`,
    color: vars.colors.text.primary,
  },
});

export const searchIcon = style({
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(26, 26, 26, 0.5)',
  pointerEvents: 'none',
});

export const rightSection = style({
  display: 'none',
  alignItems: 'center',
  gap: 16,

  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
    },
  },
});

export const toggleContainer = style({
  display: 'flex',
  backgroundColor: vars.colors.common.white,
  borderRadius: 16,
  padding: 4,
  gap: 8,
  height: 48,
  alignItems: 'center',
  boxShadow: '0px 4px 6px 0px rgba(0,0,0,0.1), 0px 2px 4px 0px rgba(0,0,0,0.1)',
});

export const toggleButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: 86,
  height: 40,
  borderRadius: 16,
  border: 'none',
  backgroundColor: 'transparent',
  color: '#4a4a4a',
  fontSize: 14,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

export const activeToggleButton = style({
  backgroundColor: '#fff4e6',
  color: vars.colors.primary.default,
  boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)',
});

export const writeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  height: 48,
  padding: '0 24px',
  borderRadius: 20,
  border: 'none',
  backgroundColor: vars.colors.common.white,
  color: vars.colors.primary.default,
  fontSize: 14,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow:
    '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
  ':hover': {
    backgroundColor: vars.colors.primary.light,
  },
});

export const profileIcon = style({
  width: 40,
  height: 40,
  borderRadius: vars.borderRadius.full,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: vars.colors.primary.default,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)',
  ':hover': {
    backgroundColor: vars.colors.common.white,
  },
});
