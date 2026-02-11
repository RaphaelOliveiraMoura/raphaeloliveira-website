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
    ".agents/**",
    ".cursor/**",
    "docs/**",
    "coverage/**",
    "tests/**",
  ]),
  {
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

      // Prevenir imports duplicados
      "no-duplicate-imports": "error",

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
    },
  },
]);

export default eslintConfig;
