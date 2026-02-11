"use client";

import { Link, useTranslations } from "@/lib/i18n";

export function DashboardNavbar() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      <Link href="/dashboard" className="text-lg font-semibold">
        {t("logo")}
      </Link>
      <nav className="flex items-center gap-4" aria-label={t("nav.secondary")}>
        <span className="text-sm text-muted-foreground">{t("nav.navigation")}</span>
      </nav>
    </header>
  );
}
