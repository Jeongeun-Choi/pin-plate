import { style } from '@vanilla-extract/css';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

export const modalContainer = style({
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '400px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
});

export const title = style({
  fontSize: '1.25rem',
  fontWeight: 'bold',
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
});

export const resultsContainer = style({
  marginTop: '20px',
  overflowY: 'auto',
  flex: 1,
});

export const resultsList = style({
  listStyle: 'none',
  padding: 0,
});

export const resultItem = style({
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid #eee',
  padding: '12px 0',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
    '&:focus-visible': {
      outline: '2px solid #000', // Focus indicator
      outlineOffset: '-2px',
    },
  },
});

export const resultItemTitle = style({
  fontWeight: 'bold',
  marginBottom: '4px',
});

export const resultItemAddress = style({
  fontSize: '12px',
  color: '#666',
});

export const resultItemCategory = style({
  fontSize: '11px',
  color: '#999',
  marginTop: '2px',
});

export const emptyState = style({
  color: '#999',
  textAlign: 'center',
  marginTop: '20px',
});

export const bottomCloseButton = style({
  width: '100%',
  padding: '10px',
  backgroundColor: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  marginTop: '20px',
  cursor: 'pointer',
});
