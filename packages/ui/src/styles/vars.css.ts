import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  colors: {
    primary: {
      default: "#FF6B35", // Sunset Orange (Main)
      hover: "#E85018", // Darker for interactions
      light: "#FFF0E6", // Background for active states
      text: "#FFFFFF", // Text on primary button
    },
    secondary: {
      bg: "#F4F2F0", // Warm Gray (Page Background)
      surface: "#FFFFFF", // Card Background
      border: "#E6E2DE", // Border color
    },
    text: {
      primary: "#222222", // Headings
      body: "#333333", // Main text
      sub: "#666666", // Subtitles
      caption: "#999999", // Placeholder, Help text
    },
    status: {
      success: "#4CAF50",
      error: "#E53935",
      warning: "#FFC107",
    },
    overlay: "rgba(0, 0, 0, 0.4)", // Modal backdrop
  },

  fontFamily: {
    body: '"Pretendard", "Noto Sans KR", sans-serif',
  },

  fontSize: {
    h1: "24px",
    h2: "20px",
    body: "16px",
    caption: "14px",
    tiny: "12px",
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    bold: "700",
  },

  lineHeight: {
    heading: "1.3",
    body: "1.5",
  },

  spacing: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px", // Base unit
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },

  borderRadius: {
    sm: "8px", // Button, Input
    md: "12px", // Card
    lg: "20px", // Modal, Bottom Sheet
    full: "9999px", // Rounded Button
  },

  shadow: {
    card: "0 2px 8px rgba(0, 0, 0, 0.08)",
    float: "0 4px 16px rgba(0, 0, 0, 0.12)",
    none: "none",
  },

  zIndex: {
    header: "50",
    bottomSheet: "100",
    toast: "200",
  },
});
