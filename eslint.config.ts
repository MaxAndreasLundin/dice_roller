import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";

export default tseslint.config(
  // 1. Base JS Rules (Logic & Best Practices)
  js.configs.recommended,

  // 2. Base TS Rules (Type checking)
  ...tseslint.configs.recommended,

  // 3. React Rules
  react.configs.flat.recommended,

  // 4. Custom Configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    // Register plugins manually for rules that need them
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
    },
  },

  // 5. Global Ignores
  { ignores: ["dist"] },

  // 6. Prettier (Always last)
  prettier
);
