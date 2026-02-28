import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const container = style({
  width: '100%',
  backgroundColor: vars.colors.common.white,
  borderRadius: 16,
  border: `4px solid #ffe4d6`,
  boxShadow:
    '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  padding: 4,
});

export const menuList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  height: 58,
  backgroundColor: vars.colors.common.white,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  borderBottom: `2px solid #ffe4d6`,
  gap: 16,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const menuIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  flexShrink: 0,
});

export const menuText = style({
  fontSize: 16,
  fontWeight: vars.fontWeight.medium,
  color: '#2d2d2d',
  marginRight: 16, // Balance the icon on the left
});

export const menuTextAccent = style({
  color: '#ff8c69',
});
