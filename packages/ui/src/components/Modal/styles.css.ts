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
  zIndex: vars.zIndex.header, // Start with header, or maybe bottomSheet/toast if available. Using 1000 in original. vars.zIndex.bottomSheet seems appropriate.
  // Original uses 1000. vars.zIndex.bottomSheet is '100'. Let's stick to Design System tokens if possible, or override.
  // PostDetailModal used rgba(0,0,0,0.7), vars.colors.overlay is rgba(139, 69, 19, 0.4).
  // The user wants it to look like PostDetailModal.
  // PostDetailModal overlay: backgroundColor: 'rgba(0, 0, 0, 0.7)'
  // I will use local value to match PostDetailModal exactly if tokens don't match, or suggest token update.
  // For now, I'll use the token but maybe override opacity if needed, OR just match the hardcoded value if it's distinct.
  // PostDetailModal: mobile align-items flex-end, desktop center.

  // Mobile: Bottom Sheet logic
  alignItems: 'flex-end',
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

  // Mobile: Bottom Sheet styles
  maxWidth: '100%',
  borderRadius: `${vars.borderRadius.lg} ${vars.borderRadius.lg} 0 0`, // 32px top
  border: `5px solid ${vars.colors.secondary.border}`,
  borderBottom: 'none',
  boxShadow: vars.boxShadow.float, // logical equivalent

  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  maxHeight: '90vh',
  transition: 'all 0.3s ease',

  '@media': {
    'screen and (min-width: 768px)': {
      // Desktop: Centered Modal styles
      maxWidth: '900px',
      height: '600px',
      borderRadius: '32px', // Explicit to match PostDetailModal or vars.borderRadius.lg? PostDetailModal used 32px. vars.lg is 20px. 32px is not in vars.borderRadius.
      // I'll use 32px to match exactly.
      borderBottom: `5px solid ${vars.colors.secondary.border}`,
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
