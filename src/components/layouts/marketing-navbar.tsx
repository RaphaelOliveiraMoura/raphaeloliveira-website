"use client";

import { Menu } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-breakpoint";
import { useScrollPosition } from "@/hooks/use-scroll-position";

const NAV_ITEMS = [
  { href: "#projects", key: "projects" },
  { href: "#about", key: "about" },
  { href: "#experience", key: "experience" },
  { href: "#education", key: "education" },
  { href: "#contact", key: "contact" },
] as const;

export function MarketingNavbar() {
  const isMobile = useIsMobile();
  const t = useTranslations("common");
  const { y: scrollY } = useScrollPosition();
  const isScrolled = scrollY > 20;

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = (
    <>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={item.href}
          onClick={(e) => handleScrollTo(e, item.href)}
          className="relative text-sm text-muted-foreground transition-colors duration-normal hover:text-foreground"
        >
          {t(`nav.${item.key}`)}
        </a>
      ))}
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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn(
              "font-semibold transition-all duration-normal",
              isScrolled ? "text-base" : "text-lg",
            )}
          >
            {t("logo")}
          </a>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={cn(
            "font-semibold transition-all duration-normal",
            isScrolled ? "text-base" : "text-lg",
          )}
        >
          {t("logo")}
        </a>
        <nav className="flex items-center gap-6" aria-label={t("nav.primary")}>
          {navLinks}
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
