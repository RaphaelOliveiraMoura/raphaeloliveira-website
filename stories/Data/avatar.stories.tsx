import type { Meta, StoryObj } from "@storybook/react";
import { Check } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

const meta = {
  title: "Data/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Avatar baseado em Radix UI com fallback automatico, badge de status, grupo de avatares e tres tamanhos (sm, default, lg).",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  name: "Tamanhos",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src="https://github.com/shadcn.png" alt="Small" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="https://github.com/shadcn.png" alt="Default" />
        <AvatarFallback>DF</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="Large" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Fallback: Story = {
  name: "Com Fallback",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>RM</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const WithBadge: Story = {
  name: "Com Badge de Status",
  render: () => (
    <div className="flex items-center gap-6">
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="Online" />
        <AvatarFallback>ON</AvatarFallback>
        <AvatarBadge className="bg-green-500" />
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>VR</AvatarFallback>
        <AvatarBadge>
          <Check />
        </AvatarBadge>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  name: "Grupo de Avatares",
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U4</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
};
