import { style } from "@vanilla-extract/css";

export const wrapper = style({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
});

export const main = style({
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});
