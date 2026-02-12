import type { z } from "zod";

import type { FieldError } from "@/lib/errors";

/**
 * Converte um ZodError em um array de FieldErrors do projeto.
 * As mensagens retornadas sao chaves i18n (ex: "validation.email.invalid")
 * que devem ser traduzidas pelo componente de formulario.
 */
export function zodToFieldErrors(zodError: z.core.$ZodError): FieldError[] {
  const issues = zodError.issues ?? [];
  return issues.map((issue) => ({
    field: issue.path.map(String).join("."),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Converte um ZodError em um mapa field -> mensagem (primeira mensagem).
 * Util para integracao direta com react-hook-form via setError.
 */
export function zodToFieldMap(
  zodError: z.core.$ZodError,
): Record<string, string> {
  const map: Record<string, string> = {};
  const issues = zodError.issues ?? [];
  for (const issue of issues) {
    const field = issue.path.map(String).join(".");
    if (!map[field]) {
      map[field] = issue.message;
    }
  }
  return map;
}

/**
 * Traduz um mapa de erros de validacao usando uma funcao de traducao.
 * Compativel com useTranslations("validation") do next-intl.
 *
 * @example
 * ```tsx
 * const t = useTranslations("validation");
 * const translated = translateFieldErrors(fieldMap, (key) => t(key));
 * ```
 */
export function translateFieldErrors(
  fieldMap: Record<string, string>,
  translate: (key: string) => string,
): Record<string, string> {
  const translated: Record<string, string> = {};
  for (const [field, messageKey] of Object.entries(fieldMap)) {
    try {
      translated[field] = translate(messageKey);
    } catch {
      // Se a chave nao existe, manter a mensagem original
      translated[field] = messageKey;
    }
  }
  return translated;
}

/**
 * Formata erros de validacao em uma lista legivel.
 * Util para exibir em toast/alert.
 */
export function formatValidationSummary(
  fieldMap: Record<string, string>,
): string {
  return Object.entries(fieldMap)
    .map(([field, message]) => `${field}: ${message}`)
    .join("\n");
}
