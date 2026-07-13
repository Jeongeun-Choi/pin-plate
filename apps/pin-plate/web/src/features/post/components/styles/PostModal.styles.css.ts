import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/vars';

export const formContainer = style({
  padding: '20px',
  overflowY: 'auto',
  height: '100%',
  width: '100%',
});

export const submitButton = style({
  width: '100%',
  fontWeight: 'bold',
});

export const existingReviewBanner = style({
  padding: '10px 20px',
  backgroundColor: vars.colors.primary.light,
  borderBottom: `1px solid ${vars.colors.background.border}`,
  color: vars.colors.text.body,
  fontSize: '13px',
  fontWeight: '600',
});
