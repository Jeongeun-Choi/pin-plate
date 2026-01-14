import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { baseConfig } from "./base.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  ...compat.extends("plugin:react/recommended", "plugin:react-hooks/recommended"),
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
