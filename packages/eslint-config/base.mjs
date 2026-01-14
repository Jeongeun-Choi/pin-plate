import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  { ignores: ["**/.prettierrc.js", "**/eslint.config.mjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
];

export default baseConfig;
