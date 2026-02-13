import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";

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
    ".agents/**",
    ".cursor/**",
    "docs/**",
    "coverage/**",
    "tests/**",
    // Backend build artifacts
    "backend/dist/**",
    "backend/node_modules/**",
  ]),
  // Prettier integration (desabilita regras conflitantes e reporta erros de formatacao)
  eslintPluginPrettierRecommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Prevenir uso de any
      "@typescript-eslint/no-explicit-any": "error",

      // Variaveis nao utilizadas sao erros (nao warnings)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Prevenir console.* em producao (usar logger centralizado)
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Preferir const sobre let quando nao ha reatribuicao
      "prefer-const": "error",

      // Garantir retorno consistente em funcoes
      "consistent-return": "off",

      // Sem comparacoes desnecessarias com boolean
      "no-unneeded-ternary": "error",

      // Prevenir uso de var
      "no-var": "error",

      // Prevenir typeof comparisons invalidas
      "valid-typeof": "error",

      // Prevenir uso de eval
      "no-eval": "error",

      // Prevenir uso de debugger
      "no-debugger": "error",

      // Ordenacao de imports conforme convencao do projeto (general.mdc)
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. React e Next.js
            ["^react", "^next"],
            // 2. Bibliotecas externas
            ["^@?(?!/)\\w"],
            // 3. Componentes (@/components/)
            ["^@/components"],
            // 4. Lib/Utils (@/lib/, @/hooks/)
            ["^@/lib", "^@/hooks"],
            // 5. Tipos (@/types/)
            ["^@/types"],
            // 6. Estilos
            ["^.+\\.s?css$"],
            // 7. Relative imports
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  // ---- Backend-specific config (no Next.js/React rules) ----
  {
    files: ["backend/**/*.ts"],
    rules: {
      // Disable Next.js and React rules that don't apply to the backend
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-head-element": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-target-blank": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/alt-text": "off",

      // Override import-sort groups for backend (no React/Next groups)
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. Node built-ins
            ["^node:"],
            // 2. External packages
            ["^@?(?!/)\\w"],
            // 3. Internal aliases (@/*)
            ["^@/"],
            // 4. Relative imports
            ["^\\."],
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
