import { style } from '@vanilla-extract/css';
import { vars } from '@pin-plate/ui/styles'; 

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
  backgroundColor: vars.colors.secondary.surface,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`,
  borderBottom: `1px solid ${vars.colors.secondary.border}`,
  position: 'sticky',
  top: 0,
  backgroundColor: vars.colors.secondary.surface,
  zIndex: 10,
});

export const content = style({
  flex: 1,
  overflowY: 'auto',
  padding: vars.spacing[4],
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[6],
});

export const sectionTitle = style({
  fontSize: vars.fontSize.body,
  fontWeight: vars.fontWeight.bold,
  marginBottom: vars.spacing[2],
  color: vars.colors.text.primary,
});

export const photoSection = style({
  display: 'flex',
  gap: vars.spacing[2],
  overflowX: 'auto',
  paddingBottom: vars.spacing[2],
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const photoAddButton = style({
  width: '80px',
  height: '80px',
  borderRadius: vars.borderRadius.sm,
  border: `1px dashed ${vars.colors.secondary.border}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.fontSize.tiny,
  color: vars.colors.text.sub,
  backgroundColor: vars.colors.secondary.bg,
  flexShrink: 0,
});

export const photoItem = style({
  width: '80px',
  height: '80px',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.colors.secondary.bg,
  position: 'relative',
  flexShrink: 0,
});

export const starRating = style({
  display: 'flex',
  gap: vars.spacing[1],
});

export const starWrapper = style({
  position: 'relative',
  display: 'inline-block',
  fontSize: '32px',
  cursor: 'pointer',
  lineHeight: 1,
});

export const starBase = style({
  color: vars.colors.secondary.border, // 비활성 색상 (회색)
});

export const starOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  color: vars.colors.primary.default, // 활성 색상 (메인 컬러)
  pointerEvents: 'none', // 클릭 이벤트가 부모(Wrapper)로 전달되도록
});
