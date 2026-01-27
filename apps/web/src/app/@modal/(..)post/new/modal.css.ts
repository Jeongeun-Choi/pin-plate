import { style, keyframes } from '@vanilla-extract/css';

const slideUp = keyframes({
  '0%': { transform: 'translateY(100%)' },
  '100%': { transform: 'translateY(0)' },
});

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  animation: `${fadeIn} 0.3s ease-out`,
});

export const content = style({
  width: '100%',
  height: '90vh',
  backgroundColor: '#fff',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  overflow: 'hidden',
  animation: `${slideUp} 0.3s ease-out forwards`,
  position: 'relative',
});

export const closeButton = style({
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  zIndex: 10,
  padding: '8px',
});
