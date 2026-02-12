import React from "react";
import { NextIntlClientProvider } from "next-intl";

import type { Preview } from "@storybook/react";

import "../src/app/globals.css";

import enAuth from "../messages/en/auth.json";
import enCommon from "../messages/en/common.json";
import enErrors from "../messages/en/errors.json";
import enExamples from "../messages/en/examples.json";
import enValidation from "../messages/en/validation.json";

const messages = {
  common: enCommon,
  auth: enAuth,
  errors: enErrors,
  examples: enExamples,
  validation: enValidation,
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Basic",
          "Form",
          "Feedback",
          "Overlay",
          "Navigation",
          "Data",
          "Layout",
          "Shared",
        ],
      },
    },
    layout: "centered",
  },
};

export default preview;
