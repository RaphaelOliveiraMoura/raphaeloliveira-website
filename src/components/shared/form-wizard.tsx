"use client";

import { useState } from "react";
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type Path,
  type Resolver,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import type { $ZodType } from "zod/v4/core";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

interface StepConfig<TValues extends FieldValues> {
  id: string;
  title: string;
  fields: Path<TValues>[];
  schema: $ZodType;
}

interface FormWizardProps<TValues extends FieldValues> {
  steps: StepConfig<TValues>[];
  defaultValues?: DefaultValues<TValues>;
  schema: $ZodType<TValues, TValues>;
  onSubmit: (data: TValues) => void | Promise<void>;
  children: (step: StepConfig<TValues>, index: number) => React.ReactNode;
  className?: string;
  submitLabel?: string;
  nextLabel?: string;
  backLabel?: string;
}

export function FormWizard<TValues extends FieldValues>({
  steps,
  defaultValues,
  schema,
  onSubmit,
  children,
  className,
  submitLabel = "Submit",
  nextLabel = "Next",
  backLabel = "Back",
}: FormWizardProps<TValues>) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<TValues>({
    resolver: zodResolver(schema) as Resolver<TValues>,
    defaultValues,
    mode: "onTouched",
  });

  const totalSteps = steps.length;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const step = steps[currentStep];

  const goBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goNext = async () => {
    if (!step) return;

    const isValid = await form.trigger(step.fields);
    if (!isValid) return;

    if (isLastStep) {
      await form.handleSubmit(onSubmit)();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  if (!step) return null;

  return (
    <FormProvider {...form}>
      <div className={cn("space-y-6", className)}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {currentStep + 1} / {totalSteps}
            </span>
            <span className="font-medium">{step.title}</span>
          </div>
          <Progress value={progressValue} aria-label="Form progress" />
        </div>

        <nav aria-label="Form steps" className="flex gap-2">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted",
              )}
              aria-current={index === currentStep ? "step" : undefined}
            />
          ))}
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void goNext();
          }}
          className="space-y-4"
        >
          {children(step, currentStep)}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isFirstStep}
            >
              {backLabel}
            </Button>
            <Button type="submit">
              {isLastStep ? submitLabel : nextLabel}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

export type { StepConfig };
