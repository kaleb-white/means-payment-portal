import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_", // Ignore unused function args like `_foo`
          varsIgnorePattern: "^_", // Ignore unused variables like `_bar`
          caughtErrorsIgnorePattern: "^_", // Ignore unused `catch` params
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-member-accessibility": [
        {
          accessibility: "explicit",
          overrides: {
            constructors: "no-public",
          },
        },
      ],
      "@typescript-eslint/consistent-type-assertions": "error",
    },
  },
];

export default eslintConfig;
