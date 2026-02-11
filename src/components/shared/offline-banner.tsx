"use client";

import { WifiOff } from "lucide-react";

import { useTranslations } from "@/lib/i18n";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const t = useTranslations("common");

  if (isOnline) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-destructive"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{t("offline.message")}</span>
    </div>
  );
}
