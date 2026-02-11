"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { applyMask, type MaskType } from "@/lib/masks";

interface MaskedInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "onPaste"
> {
  name: string;
  mask: MaskType;
}

export function MaskedInput({ name, mask, ...props }: MaskedInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...props}
          value={applyMask(field.value ?? "", mask)}
          onChange={(e) => {
            const masked = applyMask(e.target.value, mask);
            field.onChange(masked);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData?.getData("text") ?? "";
            const masked = applyMask(pasted, mask);
            field.onChange(masked);
          }}
        />
      )}
    />
  );
}
