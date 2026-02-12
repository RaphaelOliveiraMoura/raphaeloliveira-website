"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Link, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-breakpoint";
import { useScrollPosition } from "@/hooks/use-scroll-position";

export function MarketingNavbar() {
  const isMobile = useIsMobile();
  const t = useTranslations("common");
  const { y: scrollY } = useScrollPosition();
  const isScrolled = scrollY > 20;

  const navLinks = (
    <>
      <Link
        href="/features"
        className="relative text-muted-foreground transition-colors duration-normal hover:text-foreground"
      >
        {t("nav.features")}
      </Link>
      <Link
        href="/pricing"
        className="relative text-muted-foreground transition-colors duration-normal hover:text-foreground"
      >
        {t("nav.pricing")}
      </Link>
      <Link
        href="/docs"
        className="relative text-muted-foreground transition-colors duration-normal hover:text-foreground"
      >
        {t("nav.docs")}
      </Link>
      <Link
        href="/examples"
        className="relative text-muted-foreground transition-colors duration-normal hover:text-foreground"
      >
        {t("nav.examples")}
      </Link>
    </>
  );

  if (isMobile) {
    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-normal",
          isScrolled
            ? "border-border bg-background/80 shadow-sm backdrop-blur-lg"
            : "border-transparent bg-background",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className={cn(
              "font-semibold transition-all duration-normal",
              isScrolled ? "text-base" : "text-lg",
            )}
          >
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
              <nav
                className="flex flex-col gap-4 pt-8"
                aria-label={t("nav.primary")}
              >
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-normal",
        isScrolled
          ? "border-border bg-background/80 shadow-sm backdrop-blur-lg"
          : "border-transparent bg-background",
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className={cn(
            "font-semibold transition-all duration-normal",
            isScrolled ? "text-base" : "text-lg",
          )}
        >
          {t("logo")}
        </Link>
        <nav className="flex gap-6" aria-label={t("nav.primary")}>
          {navLinks}
        </nav>
      </div>
    </header>
  );
}
