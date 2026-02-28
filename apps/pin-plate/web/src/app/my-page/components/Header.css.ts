import { vars } from '@pin-plate/ui';
import { style } from '@vanilla-extract/css';

export const header = style({
  width: '100%',
  height: 60,
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  borderBottom: `4px solid ${vars.colors.secondary.border}`,
  marginBottom: 20,
});

export const headerContent = style({
  width: '100%',
  maxWidth: 600,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '0 20px',
  gap: 16,
});

export const backButton = style({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 16,
  cursor: 'pointer',
});

export const title = style({
  fontSize: 20,
  fontWeight: 900,
  color: '#1a1a1a',
  lineHeight: '28px',
  letterSpacing: '-0.45px',
});
