"use client";

import { Menu } from "lucide-react";

import { Link, useTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-breakpoint";

export function MarketingNavbar() {
  const isMobile = useIsMobile();
  const t = useTranslations("common");

  const navLinks = (
    <>
      <Link
        href="/features"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("nav.features")}
      </Link>
      <Link
        href="/pricing"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("nav.pricing")}
      </Link>
      <Link
        href="/docs"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("nav.docs")}
      </Link>
    </>
  );

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">
            {t("logo")}
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nav.openMenu")}
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-8" aria-label={t("nav.primary")}>
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          {t("logo")}
        </Link>
        <nav className="flex gap-6" aria-label={t("nav.primary")}>
          {navLinks}
        </nav>
      </div>
    </header>
  );
}
