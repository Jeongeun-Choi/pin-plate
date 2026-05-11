import { style } from '@vanilla-extract/css';

export const chip = style({
  height: 32,
  padding: '0 24px',
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  flexShrink: 0,
  border: '2px solid #ffe4d6',
  backgroundColor: '#fff4e6',
  color: '#1a1a1a',
  transition: 'all 0.2s ease',
});

export const activeChip = style({
  backgroundColor: '#ffa07a',
  borderColor: '#ffa07a',
  color: '#fff',
});
