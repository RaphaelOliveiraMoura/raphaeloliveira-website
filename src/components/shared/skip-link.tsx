"use client";

import { useTranslations } from "@/lib/i18n";

export function SkipLink() {
  const t = useTranslations("common");

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {t("accessibility.skipToContent")}
    </a>
  );
}
