import { style } from '@vanilla-extract/css';
// vars import removed

export const mainContent = style({
  width: '100%',
  maxWidth: 600, // Reasonable max width for mobile view on desktop
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export const footerMessage = style({
  marginTop: 24,
  padding: '28px 28px 4px',
  backgroundColor: '#fff4e6',
  borderRadius: 16,
  border: `4px solid #ffe4d6`,
  width: '100%',
});

export const footerText = style({
  fontSize: 16,
  lineHeight: '26px',
  color: '#1a1a1a',
  fontWeight: 900,
  whiteSpace: 'pre-wrap',
  letterSpacing: '-0.31px',
});

export const footerTextLight = style({
  fontWeight: 500,
});
