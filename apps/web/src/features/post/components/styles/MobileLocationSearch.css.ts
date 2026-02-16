import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const container = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#fff',
  zIndex: 1000, // High z-index to overlay everything
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid #fde4d8',
  backgroundColor: '#fff',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: '#6b5d52',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const title = style({
  fontSize: '18px',
  fontWeight: vars.fontWeight.bold,
  color: '#6b5d52',
});

export const searchContainer = style({
  padding: '16px 20px',
  backgroundColor: '#fff',
  display: 'flex',
  gap: '12px',
});

export const searchInputWrapper = style({
  flex: 1,
  height: '50px',
  border: '2px solid #fde4d8',
  borderRadius: vars.borderRadius['2xl'],
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
});

export const searchInput = style({
  width: '100%',
  border: 'none',
  outline: 'none',
  fontSize: vars.fontSize.base,
  color: '#6b5d52',
  backgroundColor: 'transparent',
  '::placeholder': {
    color: 'rgba(107, 93, 82, 0.5)',
  },
});

export const searchButton = style({
  width: '80px',
  height: '50px',
  backgroundColor: '#ffa07a',
  border: 'none',
  borderRadius: vars.borderRadius['2xl'],
  color: '#fff',
  fontWeight: vars.fontWeight.bold,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  cursor: 'pointer',
  fontSize: vars.fontSize.base,
  transition: 'background-color 0.2s',
  ':active': {
    backgroundColor: '#ff8c5a',
  },
});

export const resultsContainer = style({
  flex: 1,
  overflowY: 'auto',
  padding: '0 20px',
});

export const resultsList = style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const resultItem = style({
  width: '100%',
  textAlign: 'left',
  background: '#fff',
  border: 'none',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  padding: '16px 0',
  cursor: 'pointer',
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  ':last-child': {
    borderBottom: 'none',
  },
});

export const iconWrapper = style({
  width: '36px',
  height: '36px',
  backgroundColor: '#fef3e9',
  border: '2px solid #fde4d8',
  borderRadius: vars.borderRadius.xl,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffa07a',
  flexShrink: 0,
});

export const textContent = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const resultItemTitle = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  color: '#6b5d52',
});

export const resultItemCategory = style({
  fontSize: vars.fontSize.xs,
  color: '#ffa07a',
  fontWeight: vars.fontWeight.medium,
});

export const resultItemAddress = style({
  fontSize: vars.fontSize.sm,
  color: '#6b5d52',
  opacity: 0.8,
});

export const resultItemPhone = style({
  fontSize: '13px',
  color: '#999',
  marginTop: '2px',
});

export const emptyStateContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: '16px',
  padding: '40px',
  backgroundColor: '#fef3e9',
  margin: '20px',
  borderRadius: vars.borderRadius['2xl'],
  border: '2px solid #fde4d8',
});

export const emptyStateIcon = style({
  width: '64px',
  height: '64px',
  backgroundColor: '#fff',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffa07a',
  fontSize: '32px',
  border: '2px solid #fde4d8',
});

export const emptyStateTitle = style({
  fontSize: '18px',
  fontWeight: vars.fontWeight.bold,
  color: '#6b5d52',
  marginBottom: '4px',
});

export const emptyStateDesc = style({
  fontSize: '14px',
  color: '#c9a68a',
  textAlign: 'center',
});

export const loadingState = style({
  textAlign: 'center',
  padding: '20px',
  color: '#999',
});
