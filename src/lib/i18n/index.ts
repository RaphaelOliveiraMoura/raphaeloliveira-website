export { Link, redirect, usePathname, useRouter } from "./navigation";
export { useDateFormatter, useNumberFormatter } from "./formatters";

/**
 * Re-exports de next-intl para uso em componentes.
 * Componentes NUNCA devem importar diretamente de "next-intl".
 */
export { useLocale, useTranslations, useMessages, useFormatter } from "next-intl";
export { getTranslations, getLocale, getMessages } from "next-intl/server";
