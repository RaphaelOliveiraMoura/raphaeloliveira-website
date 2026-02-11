"use client";

import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type Resolver,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import type { $ZodType } from "zod/v4/core";

interface FormProps<TValues extends FieldValues> {
  schema: $ZodType<TValues, TValues>;
  defaultValues?: DefaultValues<TValues>;
  onSubmit: (data: TValues) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function Form<TValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<TValues>) {
  const form = useForm<TValues>({
    resolver: zodResolver(schema) as Resolver<TValues>,
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className ?? "space-y-4"}
      >
        {children}
      </form>
    </FormProvider>
  );
}
