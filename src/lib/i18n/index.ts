export { useDateFormatter, useNumberFormatter } from "./formatters";
export { Link, redirect, usePathname, useRouter } from "./navigation";
export { stripLocalePrefix } from "./utils";

/**
 * Re-exports de next-intl para uso em componentes.
 * Componentes NUNCA devem importar diretamente de "next-intl".
 */
export {
  useFormatter,
  useLocale,
  useMessages,
  useTranslations,
} from "next-intl";
export { getLocale, getMessages, getTranslations } from "next-intl/server";
