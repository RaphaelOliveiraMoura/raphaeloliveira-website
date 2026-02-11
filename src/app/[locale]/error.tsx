"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import { useTranslations } from "@/lib/i18n";
import { logger } from "@/lib/telemetry/logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    logger.error("Erro inesperado na aplicação", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">{t("generic")}</h1>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {t("genericMessage")}
      </p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
