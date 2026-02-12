"use client";

import { Cookie, Github, Moon, Sun, Twitter } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Link, useTranslations } from "@/lib/i18n";
import { useCookieConsent, useOnlineStatus } from "@/hooks";

import { useTheme } from "@/providers/theme-provider";

export function MarketingFooter() {
  const t = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const { reset: resetCookies } = useCookieConsent();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10 md:py-14">
        {/* Grid principal com colunas */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-semibold">
              {t("logo")}
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            {/* Status badge */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-xs text-muted-foreground">
                {t("footer.status")}:{" "}
                <span
                  className={
                    isOnline
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {isOnline ? t("footer.online") : "Offline"}
                </span>
              </span>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3 className="text-sm font-medium">{t("footer.product")}</h3>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link
                  href="/features"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("nav.features")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("nav.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.changelog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-sm font-medium">{t("footer.resources")}</h3>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("nav.documentation")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("footer.support")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h3 className="text-sm font-medium">{t("footer.community")}</h3>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github className="size-4" />
                  {t("footer.github")}
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Twitter className="size-4" />
                  {t("footer.twitter")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Barra inferior: preferencias + copyright */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Preferencias */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de idioma */}
            <LanguageSwitcher />

            {/* Theme toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("footer.toggleTheme")}
                >
                  <Sun className="mr-2 size-4 dark:hidden" />
                  <Moon className="mr-2 hidden size-4 dark:block" />
                  {t("footer.theme")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "font-semibold" : ""}
                >
                  <Sun className="mr-2 size-4" />
                  {t("footer.themeLight")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "font-semibold" : ""}
                >
                  <Moon className="mr-2 size-4" />
                  {t("footer.themeDark")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className={theme === "system" ? "font-semibold" : ""}
                >
                  {t("footer.themeSystem")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cookie preferences */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCookies}
                  aria-label={t("footer.cookiePrefs")}
                >
                  <Cookie className="mr-2 size-4" />
                  {t("footer.cookiePrefs")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("footer.cookiePrefs")}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Copyright + built with */}
          <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground md:items-end">
            <span>
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </span>
            <span className="text-xs">{t("footer.builtWith")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
