"use client";

import { GraduationCap } from "lucide-react";

import { useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  fadeInUp,
  ScaleOnHover,
  StaggerChildren,
  StaggerItem,
} from "@/lib/motion";

const EDUCATION_KEYS = ["una", "rocketseat"] as const;

export function EducationSection() {
  const t = useTranslations("portfolio");

  return (
    <section id="education" className="scroll-mt-20 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("education.title")}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("education.subtitle")}
            </p>
          </div>
        </AnimateOnScroll>

        <StaggerChildren
          staggerDelay={0.15}
          className="grid gap-6 md:grid-cols-2"
        >
          {EDUCATION_KEYS.map((key) => (
            <StaggerItem key={key}>
              <ScaleOnHover scale={1.02}>
                <div className="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {t(`education.items.${key}.institution`)}
                      </h3>
                      <p className="text-sm text-primary">
                        {t(`education.items.${key}.degree`)}
                      </p>
                    </div>
                    <GraduationCap className="size-5 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {t(`education.items.${key}.period`)}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`education.items.${key}.description`)}
                  </p>
                </div>
              </ScaleOnHover>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
