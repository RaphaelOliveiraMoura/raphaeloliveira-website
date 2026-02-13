import { locales } from "@/config/i18n";

/**
 * Remove o prefixo de locale de um pathname, se presente.
 * Util para sanitizar callbackUrls antes de usar com router.push() locale-aware.
 *
 * @example
 * stripLocalePrefix("/en/dashboard") // "/dashboard"
 * stripLocalePrefix("/pt-BR/settings") // "/settings"
 * stripLocalePrefix("/dashboard") // "/dashboard"
 * stripLocalePrefix("/en") // "/"
 */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(`/${locale}`.length);
  }
  return pathname;
}
