"use client";

import { useTranslations } from "@/lib/i18n";

export function LoadingFallback() {
  const t = useTranslations("common");

  return (
    <div className="flex items-center justify-center p-8" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
