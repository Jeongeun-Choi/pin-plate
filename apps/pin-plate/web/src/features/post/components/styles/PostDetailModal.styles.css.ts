import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  zIndex: 1000,

  // Mobile: Bottom Sheet logic
  alignItems: 'flex-end',
  padding: '0',

  '@media': {
    'screen and (min-width: 768px)': {
      // Desktop: Centered Modal logic
      alignItems: 'center',
      padding: '20px',
    },
  },
});

export const container = style({
  backgroundColor: '#fff',
  width: '100%',

  // Mobile: Bottom Sheet styles
  maxWidth: '100%',
  borderRadius: '32px 32px 0 0', // Top corners only
  border: `5px solid #ffe4d6`,
  borderBottom: 'none', // Remove bottom border for sheet
  boxShadow: '0px -4px 20px rgba(0,0,0,0.1)', // Upward shadow

  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  maxHeight: '90vh', // Takes up to 90% of screen height
  transition: 'all 0.3s ease',

  '@media': {
    'screen and (min-width: 768px)': {
      // Desktop: Centered Modal styles
      maxWidth: '900px',
      height: '600px',
      borderRadius: '32px', // Full rounded
      borderBottom: `5px solid #ffe4d6`, // Restore border
      boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px',
  backgroundColor: '#fff',
  flexShrink: 0,
});

export const headerTitle = style({
  fontSize: vars.fontSize.xl, // h2
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: vars.colors.text.sub,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    color: vars.colors.text.primary,
  },
});

export const scrollArea = style({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  // Make sure scroll works properly in bottom sheet
  paddingBottom: 'safe-area-inset-bottom',

  '@media': {
    'screen and (min-width: 768px)': {
      flexDirection: 'row',
      overflow: 'hidden', // Desktop handles scroll in content pane
      paddingBottom: 0,
    },
  },
});

export const imageContainer = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9', // Approximate
  backgroundColor: vars.colors.primary.light,
  flexShrink: 0,

  '@media': {
    'screen and (min-width: 768px)': {
      width: '50%',
      height: '100%',
      aspectRatio: 'auto',
    },
  },
});

export const postImage = style({
  objectFit: 'cover',
});

export const content = style({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',

  '@media': {
    'screen and (min-width: 768px)': {
      width: '50%',
      height: '100%',
      overflowY: 'auto',
      padding: '32px', // More breathing room on desktop
    },
  },
});

export const titleRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
});

export const title = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: '900', // Black as per Figma
  color: '#6b5d52', // Specific color from Figma
  flex: 1,
});

export const ratingBadge = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: '#fff8ed', // Light yellow/beige
  border: '2px solid #ffe4d6',
  borderRadius: vars.borderRadius.xl,
  padding: '4px 12px',
  color: '#6b5d52',
  fontWeight: vars.fontWeight.bold,
  flexShrink: 0,
});

export const starIcon = style({
  color: '#ffd93d', // Star color
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#6b5d52',
  fontSize: vars.fontSize.sm,
});

export const descriptionBox = style({
  backgroundColor: '#fff8ed', // Beige background
  border: '1px solid #ffe4d6',
  borderRadius: vars.borderRadius['2xl'],
  padding: '16px',
  color: '#6b5d52',
  fontSize: vars.fontSize.sm,
  lineHeight: '1.6',
});

export const actionFooter = style({
  padding: '20px',
  borderTop: `1px solid ${vars.colors.secondary.border}`,
  display: 'flex',
  gap: '12px',
  backgroundColor: '#fff',
  flexShrink: 0,
  // Ensure footer is visible and respects safe area on mobile
  paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
});

export const actionButton = style({
  flex: 1,
  height: '48px',
  borderRadius: vars.borderRadius.xl,
  border: 'none',
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s',
});

export const editButton = style([
  actionButton,
  {
    backgroundColor: '#ffa07a', // Peach
    color: '#fff',
    ':hover': {
      backgroundColor: '#ff8c69',
    },
  },
]);

export const deleteButton = style([
  actionButton,
  {
    backgroundColor: '#fff8ed',
    color: '#ff6b6b', // Warning/Error color
    border: '1px solid #ffe4d6',
    ':hover': {
      backgroundColor: '#ffe4d6',
    },
  },
]);
