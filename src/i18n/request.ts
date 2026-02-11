import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && routing.locales.includes(requested as "pt-BR" | "en" | "es")
      ? requested
      : routing.defaultLocale;

  return {
    locale,
    messages: {
      common: (await import(`../../messages/${locale}/common.json`)).default,
      auth: (await import(`../../messages/${locale}/auth.json`)).default,
      errors: (await import(`../../messages/${locale}/errors.json`)).default,
      examples: (await import(`../../messages/${locale}/examples.json`)).default,
    },
  };
});
