import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink, ErrorBoundary } from "@/components/shared";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

import { routing } from "@/i18n/routing";

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "pt-BR" | "en" | "es")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <TooltipProvider>
          <NextIntlClientProvider messages={messages}>
            <ErrorBoundary>
              <SkipLink />
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
            </ErrorBoundary>
            <Toaster />
          </NextIntlClientProvider>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
