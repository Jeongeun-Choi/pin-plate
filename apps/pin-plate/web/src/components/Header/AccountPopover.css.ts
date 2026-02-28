import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const popoverContainer = style({
  position: 'absolute',
  top: 'calc(100% + 8px)', // Below header icon
  right: 24, // Align right near profile icon
  width: 280,
  backgroundColor: vars.colors.common.white,
  borderRadius: 20,
  boxShadow: '0px 10px 25px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: vars.zIndex.header,
});

export const topSection = style({
  backgroundColor: vars.colors.primary.light,
  padding: '24px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

export const avatar = style({
  width: 56,
  height: 56,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const userInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const userName = style({
  fontSize: 18,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
  margin: 0,
});

export const userEmail = style({
  fontSize: 14,
  color: vars.colors.text.body,
  margin: 0,
});

export const bottomSection = style({
  padding: '16px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left',
  ':hover': {
    backgroundColor: vars.colors.secondary.bg,
  },
});

export const menuItemIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const menuItemText = style({
  fontSize: 16,
  fontWeight: vars.fontWeight.medium,
});

// Specific styling for standard menu items
export const standardMenuText = style([
  menuItemText,
  {
    color: vars.colors.text.primary,
  },
]);

export const standardMenuIcon = style([
  menuItemIcon,
  {
    color: vars.colors.text.body,
  },
]);

// Specific styling for logout
export const logoutMenuText = style([
  menuItemText,
  {
    color: vars.colors.btn.danger.bg,
  },
]);

export const logoutMenuIcon = style([
  menuItemIcon,
  {
    color: vars.colors.btn.danger.bg,
  },
]);
