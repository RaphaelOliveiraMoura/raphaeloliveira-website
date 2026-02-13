import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import {
  ErrorBoundary,
  NavigationProgress,
  SkipLink,
} from "@/components/shared";
import { WebVitalsReporter } from "@/components/telemetry/web-vitals-reporter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/providers/auth-provider";
import { MotionProvider } from "@/providers/motion-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

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
        <MotionProvider>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>
              <AuthProvider>
                <ErrorBoundary>
                  <NavigationProgress />
                  <SkipLink />
                  <main id="main-content" tabIndex={-1}>
                    {children}
                  </main>
                </ErrorBoundary>
                <Toaster />
                <WebVitalsReporter />
              </AuthProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
        </MotionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
