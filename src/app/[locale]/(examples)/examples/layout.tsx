import { ArrowLeft } from "lucide-react";

import { getTranslations, Link } from "@/lib/i18n";

export default async function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("examples");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Core Stack
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{t("title")}</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
