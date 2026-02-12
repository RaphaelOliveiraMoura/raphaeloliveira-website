import type { Meta, StoryObj } from "@storybook/react";

import { CookieConsentBanner } from "@/components/shared/cookie-consent-banner";

const meta = {
  title: "Shared/CookieConsentBanner",
  component: CookieConsentBanner,
  parameters: {
    docs: {
      description: {
        component:
          "Banner fixo no rodape para consentimento de cookies. Integra com useCookieConsent hook. Exibe ao primeiro acesso.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof CookieConsentBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "O banner aparece automaticamente quando nao ha consentimento armazenado. Limpe o localStorage para testar.",
      },
    },
  },
};
