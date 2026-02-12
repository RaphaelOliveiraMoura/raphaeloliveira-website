import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

import { ThemeProvider } from "@/providers/theme-provider";

import enCommon from "../../messages/en/common.json";
import enAuth from "../../messages/en/auth.json";
import enErrors from "../../messages/en/errors.json";
import enExamples from "../../messages/en/examples.json";
import enValidation from "../../messages/en/validation.json";

const testMessages = {
  common: enCommon,
  auth: enAuth,
  errors: enErrors,
  examples: enExamples,
  validation: enValidation,
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <NextIntlClientProvider locale="en" messages={testMessages}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: AllProviders,
      ...options,
    }),
  };
}

export * from "@testing-library/react";
export { customRender as render, userEvent };
