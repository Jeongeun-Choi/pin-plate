import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  padding: '24px',
  backgroundColor: vars.colors.common.white,
  borderRadius: 16,
  border: `4px solid #ffe4d6`,
  boxShadow:
    '0px 10px 15px 0px rgba(0,0,0,0.1), 0px 4px 6px 0px rgba(0,0,0,0.1)',
  width: '100%',
  height: 140,
  gap: 16,
});

export const infoContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
});

export const nickname = style({
  fontSize: 24,
  fontWeight: 900,
  color: '#1a1a1a',
  lineHeight: '32px',
  letterSpacing: '0.07px',
});

export const email = style({
  fontSize: 16,
  fontWeight: 500,
  color: '#4a4a4a',
  lineHeight: '24px',
  letterSpacing: '-0.31px',
});
