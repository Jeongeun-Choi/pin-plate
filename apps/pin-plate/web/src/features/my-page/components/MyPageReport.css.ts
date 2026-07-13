import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui';

export const reportSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
});

export const reportHeader = style({
  padding: `0 ${vars.spacing[1]}`,
});

export const reportTitle = style({
  fontSize: vars.fontSize.xl,
  lineHeight: vars.lineHeight.heading,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const reportDescription = style({
  marginTop: vars.spacing[1],
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const lockedPreview = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: vars.borderRadius['2xl'],
  backgroundColor: vars.colors.common.white,
  border: `4px solid ${vars.colors.background.border}`,
  boxShadow: vars.boxShadow.lg,
});

export const previewContent = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
  filter: 'blur(4px)',
  pointerEvents: 'none',
  userSelect: 'none',
  '@media': {
    '(max-width: 767px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const previewContentUnlocked = style([
  previewContent,
  {
    filter: 'none',
    pointerEvents: 'auto',
    userSelect: 'auto',
  },
]);

export const tabbedPreviewContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
});

export const tabList = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.spacing[2],
  padding: vars.spacing[1],
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.background.bg,
});

export const tab = style({
  minHeight: 44,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: 'transparent',
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});

export const tabActive = style([
  tab,
  {
    backgroundColor: vars.colors.common.white,
    color: vars.colors.primary.default,
    boxShadow: vars.boxShadow.sm,
  },
]);

export const periodTabList = style({
  width: 'fit-content',
  display: 'flex',
  gap: vars.spacing[1],
  padding: vars.spacing[1],
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
  border: `1px solid ${vars.colors.background.border}`,
});

export const periodTab = style({
  minWidth: 68,
  minHeight: 36,
  border: 'none',
  borderRadius: vars.borderRadius.full,
  backgroundColor: 'transparent',
  color: vars.colors.text.body,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});

export const periodTabActive = style([
  periodTab,
  {
    backgroundColor: vars.colors.primary.default,
    color: vars.colors.common.white,
  },
]);

export const chartCard = style({
  minHeight: 280,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  padding: vars.spacing[4],
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.background.bg,
});

export const previewChartCard = style([
  chartCard,
  {
    minHeight: 132,
  },
]);

export const chartTitle = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const restaurantRankFrame = style({
  width: '100%',
  minHeight: 220,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
});

export const previewRestaurantRankFrame = style([
  restaurantRankFrame,
  {
    minHeight: 132,
  },
]);

export const restaurantRankList = style({
  width: '100%',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[3],
  listStyle: 'none',
});

export const restaurantRankItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const restaurantRankHeader = style({
  display: 'grid',
  gridTemplateColumns: '24px minmax(0, 1fr) max-content',
  alignItems: 'center',
  gap: vars.spacing[2],
});

export const restaurantRankNumber = style({
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.primary.default,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
});

export const restaurantName = style({
  minWidth: 0,
  overflow: 'hidden',
  display: '-webkit-box',
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.body,
  overflowWrap: 'anywhere',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  wordBreak: 'keep-all',
});

export const restaurantCount = style({
  color: vars.colors.text.body,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
});

export const restaurantBarTrack = style({
  height: 8,
  overflow: 'hidden',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
});

export const restaurantBarFill = style({
  display: 'block',
  height: '100%',
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.primary.default,
});

export const donutSummary = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing[8],
  minHeight: 220,
  '@media': {
    '(max-width: 420px)': {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
});

export const previewDonutSummary = style([
  donutSummary,
  {
    gap: vars.spacing[4],
    minHeight: 132,
  },
]);

export const pieFrame = style({
  width: 156,
  height: 156,
  flexShrink: 0,
});

export const previewPieFrame = style([
  pieFrame,
  {
    width: 88,
    height: 88,
  },
]);

export const locationList = style({
  minWidth: 160,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const locationRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: vars.spacing[2],
  fontSize: vars.fontSize.xs,
  color: vars.colors.text.body,
});

export const legendLabel = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing[2],
});

export const legendDot = style({
  width: 8,
  height: 8,
  flexShrink: 0,
  borderRadius: vars.borderRadius.full,
});

export const tagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing[2],
  alignContent: 'flex-start',
  minHeight: 220,
});

export const previewTagList = style([
  tagList,
  {
    minHeight: 132,
  },
]);

export const tagChip = style({
  padding: `${vars.spacing[1]} ${vars.spacing[3]}`,
  borderRadius: vars.borderRadius.full,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.primary.default,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
});

export const emptyChartState = style({
  minHeight: 96,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  fontWeight: vars.fontWeight.medium,
  textAlign: 'center',
});

export const lockOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing[4],
  padding: vars.spacing[6],
  backgroundColor: `color-mix(in srgb, ${vars.colors.common.white} 72%, transparent)`,
  textAlign: 'center',
});

export const lockCopy = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
});

export const lockTitle = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.heading,
  fontWeight: vars.fontWeight.bold,
  color: vars.colors.text.primary,
});

export const lockDescription = style({
  maxWidth: 360,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
  fontWeight: vars.fontWeight.medium,
  color: vars.colors.text.body,
});

export const overlayButton = style({
  minHeight: 44,
  padding: `0 ${vars.spacing[5]}`,
  border: 'none',
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.primary.default,
  color: vars.colors.common.white,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
});
