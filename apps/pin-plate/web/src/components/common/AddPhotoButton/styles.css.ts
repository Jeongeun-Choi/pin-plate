import { style } from '@vanilla-extract/css';

export const container = style({
  width: '110px',
  height: '110px',
  borderRadius: '16px',
  backgroundColor: '#FEF3E9',
  border: '2px solid #FDE4D8',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  padding: 0,
});

export const text = style({
  fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
  fontWeight: 900,
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8B6F5C',
  textAlign: 'center',
});

export const icon = style({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8B6F5C',
});
