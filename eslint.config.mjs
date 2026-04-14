import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scratch/temp scripts
    "tmp_*.cjs",
  ]),
  {
    rules: {
      // Dynamic codebase with many third-party integrations — 'any' is acceptable
      "@typescript-eslint/no-explicit-any": "off",
      // Allow require() in non-module contexts (API routes, scripts)
      "@typescript-eslint/no-require-imports": "off",
      // Downgrade image warnings — not performance-critical for builder canvas
      "@next/next/no-img-element": "off",
      // Allow unused vars in catch blocks and intentional destructuring
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_|^e$"
      }],
      // Custom font in layout is intentional
      "@next/next/no-page-custom-font": "off",
      // prefer-const — enforce
      "prefer-const": "error",
    },
  },
]);

export default eslintConfig;
