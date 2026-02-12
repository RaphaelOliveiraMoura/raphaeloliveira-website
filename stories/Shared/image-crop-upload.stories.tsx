import type { Meta, StoryObj } from "@storybook/react";

import { ImageCropUpload } from "@/components/shared/image-crop-upload";

const meta = {
  title: "Shared/ImageCropUpload",
  component: ImageCropUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Upload de imagem com recorte (crop) integrado. Abre um dialog com react-image-crop para o usuario ajustar a area de recorte antes de confirmar. Retorna um Blob da imagem cortada.",
      },
    },
  },
} satisfies Meta<typeof ImageCropUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCropped: (blob) => alert(`Cropped image: ${blob.size} bytes`),
    aspectRatio: 1,
    label: "Upload avatar",
  },
};

export const WideAspect: Story = {
  name: "Aspecto 16:9",
  args: {
    onCropped: (blob) => alert(`Cropped image: ${blob.size} bytes`),
    aspectRatio: 16 / 9,
    label: "Upload cover image",
    confirmLabel: "Apply crop",
    cancelLabel: "Discard",
  },
};
