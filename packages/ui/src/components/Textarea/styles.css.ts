import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/vars.css";

export const textareaStyle = style({
  display: "flex",
  width: "100%", // Textarea는 기본적으로 가로를 채우도록 설정
  minHeight: "100px", // 기본 높이 설정
  color: vars.colors.text.primary,
  padding: `${vars.spacing[3]} ${vars.spacing[4]}`, // Input보다 위아래 패딩을 조금 넉넉하게
  borderRadius: vars.borderRadius.sm,
  border: `1px solid ${vars.colors.secondary.border}`,
  fontSize: vars.fontSize.tiny, // 가독성을 위해 본문 사이즈 사용 (원하시면 tiny로 변경 가능)
  fontWeight: vars.fontWeight.regular,
  fontFamily: vars.fontFamily.body,
  resize: "none", // 크기 조절 기능 비활성화
  outline: "none",

  ":focus": {
    borderColor: vars.colors.primary.default,
  },

  ":disabled": {
    backgroundColor: vars.colors.secondary.bg,
    cursor: "not-allowed",
    opacity: 0.5,
  },

  "::placeholder": {
    color: vars.colors.text.caption,
  },
});
