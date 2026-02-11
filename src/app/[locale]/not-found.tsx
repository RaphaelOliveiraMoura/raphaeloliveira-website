import { Button } from "@/components/ui/button";

import { Link, useTranslations } from "@/lib/i18n";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">{t("notFound")}</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {t("notFoundMessage")}
      </p>
      <Button asChild>
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
