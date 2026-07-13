import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: vars.zIndex.toast,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.spacing[4],
  backgroundColor: vars.colors.overlay,
  '@media': {
    '(max-width: 640px)': {
      alignItems: 'flex-end',
      padding: 0,
    },
  },
});

export const dialog = style({
  width: 'min(100%, 560px)',
  maxHeight: 'calc(100dvh - 32px)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.background.surface,
  boxShadow: vars.boxShadow.xl,
  '@media': {
    '(max-width: 640px)': {
      width: '100%',
      maxHeight: '88dvh',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  },
});

export const header = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.spacing[4],
  padding: vars.spacing[5],
  borderBottom: `1px solid ${vars.colors.background.border}`,
  '@media': {
    '(max-width: 640px)': {
      padding: vars.spacing[4],
    },
  },
});

export const heading = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
});

export const subheading = style({
  margin: `${vars.spacing[1]} 0 0`,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const closeButton = style({
  width: 32,
  height: 32,
  flexShrink: 0,
  padding: 0,
  borderRadius: vars.borderRadius.full,
  color: vars.colors.text.sub,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[5],
  padding: vars.spacing[5],
  overflowY: 'auto',
  '@media': {
    '(max-width: 640px)': {
      gap: vars.spacing[4],
      padding: vars.spacing[4],
    },
  },
});

export const stepList = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: vars.spacing[2],
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const stepItem = style({
  minWidth: 0,
  padding: `${vars.spacing[2]} ${vars.spacing[3]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  textAlign: 'center',
});

export const stepItemCurrent = style([
  stepItem,
  {
    borderColor: vars.colors.primary.default,
    backgroundColor: vars.colors.primary.light,
    color: vars.colors.text.primary,
  },
]);

export const fieldGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const label = style({
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
});

export const input = style({
  width: '100%',
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.sm,
  outline: 'none',
  ':focus': {
    borderColor: vars.colors.primary.default,
    boxShadow: `0 0 0 3px ${vars.colors.primary.light}`,
  },
  '::placeholder': {
    color: vars.colors.text.sub,
  },
});

export const textarea = style([
  input,
  {
    minHeight: 72,
    resize: 'vertical',
    fontFamily: vars.fontFamily.body,
  },
]);

export const radioGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.spacing[2],
});

export const criteriaFieldset = style({
  minInlineSize: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const criteriaLegend = style([
  label,
  {
    padding: 0,
    marginBottom: vars.spacing[1],
  },
]);

export const radioLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
  minHeight: 42,
  padding: `${vars.spacing[2]} ${vars.spacing[3]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  cursor: 'pointer',
  selectors: {
    '&:has(input:checked)': {
      borderColor: vars.colors.primary.default,
      backgroundColor: vars.colors.primary.light,
      color: vars.colors.text.primary,
      fontWeight: vars.fontWeight.bold,
    },
  },
});

export const radioInput = style({
  width: 18,
  height: 18,
  margin: 0,
  flexShrink: 0,
  appearance: 'none',
  border: `2px solid ${vars.colors.common.white}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
  accentColor: vars.colors.primary.default,
  boxShadow: `0 0 0 1px ${vars.colors.background.border}`,
  selectors: {
    '&:checked': {
      borderColor: vars.colors.common.white,
      backgroundColor: vars.colors.primary.default,
      boxShadow: `inset 0 0 0 4px ${vars.colors.common.white}, 0 0 0 1px ${vars.colors.primary.default}`,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.colors.primary.default}`,
      outlineOffset: 2,
    },
  },
});

export const criteriaControls = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
});

export const tagFieldset = style({
  minInlineSize: 0,
  margin: 0,
  padding: 0,
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const tagLegend = style([
  label,
  {
    padding: 0,
    marginBottom: vars.spacing[1],
  },
]);

export const tagChipGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.spacing[2],
});

export const emptyTagText = style({
  margin: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const tagGroupList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[5],
});

export const tagPickerSearch = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
  paddingBottom: vars.spacing[3],
  backgroundColor: vars.colors.background.surface,
});

export const tagGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const tagGroupHeading = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.body,
});

export const tagOptionList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const tagOptionRow = style({
  width: '100%',
  minHeight: 48,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: vars.spacing[2],
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  textAlign: 'left',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: vars.colors.primary.light,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.colors.primary.default}`,
    outlineOffset: 2,
  },
});

export const selectedTagOptionRow = style({
  borderColor: vars.colors.primary.default,
  backgroundColor: vars.colors.primary.light,
  color: vars.colors.text.primary,
});

export const tagOptionName = style({
  minWidth: 0,
  overflow: 'hidden',
  color: vars.colors.text.primary,
  fontWeight: vars.fontWeight.bold,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const tagOptionMeta = style({
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  whiteSpace: 'nowrap',
});

export const tagOptionSelectedText = style({
  color: vars.colors.primary.default,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  whiteSpace: 'nowrap',
});

export const selectionSummary = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
  '@media': {
    '(max-width: 520px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  },
});

export const selectionSummaryText = style({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: vars.spacing[1],
});

export const selectionSummaryTitle = style({
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.body,
});

export const selectionSummaryDescription = style({
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  lineHeight: vars.lineHeight.body,
});

export const manualPickerList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const placePickerItem = style({
  padding: vars.spacing[2],
  borderRadius: vars.borderRadius.xl,
  ':hover': {
    backgroundColor: vars.colors.primary.light,
  },
});

export const checkboxLabel = style({
  display: 'flex',
  alignItems: 'flex-start',
  flex: 1,
  gap: vars.spacing[2],
  minWidth: 0,
  borderRadius: vars.borderRadius.xl,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  cursor: 'pointer',
});

export const placeText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[1],
});

export const placeName = style({
  color: vars.colors.text.primary,
  fontWeight: vars.fontWeight.bold,
});

export const placeAddress = style({
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  lineHeight: vars.lineHeight.body,
});

export const countText = style({
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const emptyText = style({
  color: vars.colors.brand.secondary,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
});

export const errorText = style({
  margin: 0,
  color: vars.colors.brand.secondary,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const feedbackText = style({
  margin: 0,
  color: vars.colors.primary.default,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.body,
});

export const successArea = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.light,
});

export const previewCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
  padding: vars.spacing[4],
  border: `1px solid ${vars.colors.background.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
});

export const previewEyebrow = style({
  margin: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
});

export const previewTitle = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
});

export const previewDescription = style({
  margin: 0,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const previewMeta = style({
  margin: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
});

export const shareUrlRow = style({
  display: 'flex',
  gap: vars.spacing[2],
  '@media': {
    '(max-width: 520px)': {
      flexDirection: 'column',
    },
  },
});

export const shareUrlInput = style([
  input,
  {
    flex: 1,
    backgroundColor: vars.colors.common.white,
  },
]);

export const footer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.spacing[3],
  padding: vars.spacing[5],
  borderTop: `1px solid ${vars.colors.background.border}`,
  backgroundColor: vars.colors.background.surface,
  '@media': {
    '(max-width: 640px)': {
      position: 'sticky',
      bottom: 0,
      padding: `${vars.spacing[4]} ${vars.spacing[4]} calc(${vars.spacing[4]} + env(safe-area-inset-bottom))`,
    },
  },
});
