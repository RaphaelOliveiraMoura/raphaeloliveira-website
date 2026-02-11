import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta: Meta<typeof Textarea> = {
  title: "Basic/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Campo de texto multi-linha com field-sizing automatico. Integra com sistema de validacao e design tokens.",
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
  },
};

export const WithLabel: Story = {
  name: "Com Label",
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
      <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled textarea",
    value: "Cannot edit this content",
  },
};

export const Invalid: Story = {
  name: "Estado de Erro",
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" aria-invalid="true" defaultValue="ab" />
      <p className="text-sm text-destructive">Minimo de 10 caracteres</p>
    </div>
  ),
};
