import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: '100%',
});

export const section = style({
  backgroundColor: '#ffffff',
  borderRadius: 16,
  border: '4px solid #ffe4d6',
  padding: 28,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  boxShadow:
    '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
});

export const label = style({
  fontSize: 14,
  fontWeight: 900,
  color: '#4a4a4a',
  marginBottom: 4,
});

// Avatar styles removed

export const inputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const inputLabel = style({
  fontSize: 14,
  fontWeight: 900,
  color: '#4a4a4a',
});

export const readOnlyField = style({
  backgroundColor: '#fff4e6',
  border: '2px solid #ffe4d6',
  borderRadius: 16,
  padding: '14px 14px',
  fontSize: 16,
  fontWeight: 700,
  color: '#1a1a1a',
});

export const inputField = style({
  backgroundColor: '#fff4e6',
  border: '3px solid #ffe4d6',
  borderRadius: 16,
  padding: '12px 16px',
  fontSize: 16,
  fontWeight: 700,
  color: '#1a1a1a',
  outline: 'none',
  width: '100%',
  '::placeholder': {
    color: 'rgba(26, 26, 26, 0.5)',
  },
});

export const charCount = style({
  fontSize: 12,
  color: '#6b6b6b',
  fontWeight: 500,
  textAlign: 'right',
  marginTop: 4,
});

export const saveButton = style({
  width: '100%',
  height: 54,
  backgroundColor: '#ffa07a',
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 900,
  borderRadius: 16,
  border: 'none',
  cursor: 'pointer',
  marginTop: 24,
  marginBottom: 40,
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#ff8c5a',
  },
  ':disabled': {
    backgroundColor: '#ffd0b0',
    cursor: 'not-allowed',
  },
});
