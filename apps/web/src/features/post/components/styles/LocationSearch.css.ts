import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
});

export const searchContainer = style({
  display: 'flex',
  gap: '8px',
  width: '100%',
});

export const searchInputWrapper = style({
  flex: 1,
  height: '50px',
  border: '2px solid #fde4d8',
  borderRadius: '16px',
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
  boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1)',
});

export const searchInput = style({
  width: '100%',
  border: 'none',
  outline: 'none',
  fontSize: '16px',
  color: '#6b5d52',
  '::placeholder': {
    color: 'rgba(107, 93, 82, 0.5)',
  },
});

export const searchButton = style({
  width: '80px',
  height: '50px',
  backgroundColor: '#ffa07a',
  border: '2px solid #fff',
  borderRadius: '16px',
  color: '#fff',
  fontWeight: vars.fontWeight.bold,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  cursor: 'pointer',
  boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: '#ff8c69',
  },
});

export const resultsContainer = style({
  width: '100%',
  maxHeight: '300px', // Limit height for scrolling within the form
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '4px', // Space for shadows
  border: '1px solid #fde4d8',
  borderRadius: '16px',
  backgroundColor: '#fff',
});

export const resultsList = style({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const resultItem = style({
  width: '100%',
  textAlign: 'left',
  background: '#fff',
  border: 'none',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  padding: '12px',
  cursor: 'pointer',
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  transition: 'background-color 0.2s',
  borderRadius: '12px',
  ':hover': {
    backgroundColor: '#fff8ed',
  },
  ':last-child': {
    borderBottom: 'none',
  },
});

export const iconWrapper = style({
  width: '36px',
  height: '36px',
  backgroundColor: '#fef3e9',
  border: '2px solid #fde4d8',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: '#ffa07a',
});

export const textContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const resultItemTitle = style({
  fontSize: '15px',
  fontWeight: vars.fontWeight.bold,
  color: '#6b5d52',
});

export const resultItemCategory = style({
  fontSize: '11px',
  fontWeight: vars.fontWeight.medium,
  color: '#daa520',
});

export const resultItemAddress = style({
  fontSize: '13px',
  color: '#c9a68a',
  letterSpacing: '-0.15px',
});

export const resultItemPhone = style({
  fontSize: '11px',
  color: '#b8a390',
  marginTop: '2px',
});

export const emptyState = style({
  color: '#999',
  textAlign: 'center',
  padding: '20px',
});
