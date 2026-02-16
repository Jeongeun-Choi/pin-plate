import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const container = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '35px',
});

export const headerTitle = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold, // or 900
  color: '#6b5d52',
  letterSpacing: '-0.3px',
});

export const retestButton = style({
  height: '35px',
  padding: '0 12px',
  borderRadius: '14px', // Custom
  backgroundColor: '#fef3e9',
  border: '1.4px solid #fde4d8',
  color: '#f4a68a',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#ffe8d1',
  },
});

export const card = style({
  width: '100%',
  backgroundColor: '#fef3e9',
  border: '3px solid #fde4d8',
  borderRadius: vars.borderRadius['2xl'],
  padding: '19px',
  paddingBottom: '3px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const infoRow = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '4px',
});

export const iconWrapper = style({
  width: '40px',
  height: '40px',
  backgroundColor: '#fff',
  border: '3px solid #fde4d8',
  borderRadius: '14px', // Custom
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: '3px',
});

export const textContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
});

export const placeName = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  color: '#6b5d52',
  lineHeight: '24px',
});

export const address = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: '#c9a68a',
  lineHeight: '20px',
});

export const mapContainer = style({
  width: '100%',
  height: '200px',
  backgroundColor: '#ddd',
  borderRadius: '14px', // Custom
  overflow: 'hidden',
  border: '3px solid #fde4d8',
  marginBottom: '15px',
  position: 'relative',
});
