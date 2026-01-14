import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  {
    ignores: [
      "**/.prettierrc.js",
      "**/eslint.config.mjs",
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default baseConfig;
