"use client";

import { Cookie, Github, Linkedin, Mail, Moon, Sun } from "lucide-react";

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

import { useTranslations } from "@/lib/i18n";
import { useCookieConsent } from "@/hooks";

import { useTheme } from "@/providers/theme-provider";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/RaphaelOliveiraMoura",
    icon: Github,
    key: "github" as const,
  },
  {
    href: "https://www.linkedin.com/in/raphaeloliveiramoura/",
    icon: Linkedin,
    key: "linkedin" as const,
  },
  {
    href: "mailto:raphael.moura0208@gmail.com",
    icon: Mail,
    key: "email" as const,
  },
];

export function MarketingFooter() {
  const t = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const { reset: resetCookies } = useCookieConsent();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          {/* Brand */}
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-lg font-semibold"
            >
              {t("logo")}
            </a>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((link) => (
              <Button key={link.key} variant="ghost" size="icon" asChild>
                <a
                  href={link.href}
                  target={link.key === "email" ? undefined : "_blank"}
                  rel={link.key === "email" ? undefined : "noopener noreferrer"}
                  aria-label={t(`footer.${link.key}`)}
                >
                  <link.icon className="size-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Barra inferior */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Preferencias */}
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />

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

          {/* Copyright */}
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
