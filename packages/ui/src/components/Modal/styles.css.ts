import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: vars.colors.overlay, // Use token
  display: 'flex',
  justifyContent: 'center',

  // Mobile: Full screen logic
  alignItems: 'flex-start', // Start from top
  padding: '0',

  '@media': {
    'screen and (min-width: 768px)': {
      // Desktop: Centered Modal logic
      alignItems: 'center',
      padding: vars.spacing[5], // 20px
    },
  },
});

export const container = style({
  backgroundColor: vars.colors.secondary.surface, // #fff
  width: '100%',

  // Mobile: Full screen styles
  height: '100%',
  maxHeight: 'none',
  borderRadius: 0,
  border: 'none',
  boxShadow: 'none',

  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'all 0.3s ease',

  '@media': {
    'screen and (min-width: 768px)': {
      // Desktop: Centered Modal styles
      maxWidth: '900px',
      maxHeight: '90vh',
      height: '600px',
      borderRadius: '32px',
      border: `5px solid ${vars.colors.secondary.border}`,
      boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)', // Custom shadow
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: vars.spacing[5], // 20px
  backgroundColor: vars.colors.secondary.surface,
  flexShrink: 0,
});

export const headerTitle = style({
  fontSize: vars.fontSize.h2, // 20px
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: vars.spacing[1], // 4px
  color: vars.colors.text.sub,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    color: vars.colors.text.primary,
  },
});

export const content = style({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 'safe-area-inset-bottom',

  '@media': {
    'screen and (min-width: 768px)': {
      flexDirection: 'row',
      overflow: 'hidden',
      paddingBottom: 0,
    },
  },
});

export const footer = style({
  padding: vars.spacing[5],
  borderTop: `1px solid ${vars.colors.secondary.border}`,
  display: 'flex',
  gap: vars.spacing[3], // 12px
  backgroundColor: vars.colors.secondary.surface,
  flexShrink: 0,
  paddingBottom: `calc(${vars.spacing[5]} + env(safe-area-inset-bottom))`,
});
