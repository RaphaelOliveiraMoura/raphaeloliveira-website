import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { FileUpload } from "@/components/shared/file-upload";

const meta = {
  title: "Shared/FileUpload",
  component: FileUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Componente de upload com drag-and-drop via react-dropzone. Suporta preview de imagens, validacao de tipo e tamanho, e multiplos arquivos.",
      },
    },
    layout: "padded",
  },
} satisfies Meta<typeof FileUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onUpload: fn(),
  },
};

export const ImagesOnly: Story = {
  name: "Apenas Imagens",
  args: {
    onUpload: fn(),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 2 * 1024 * 1024,
    maxFiles: 3,
  },
};

export const SingleFile: Story = {
  name: "Arquivo Unico",
  args: {
    onUpload: fn(),
    maxFiles: 1,
    accept: { "application/pdf": [".pdf"] },
  },
};
