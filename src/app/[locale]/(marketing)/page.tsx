"use client";

import {
  ArrowRight,
  Blocks,
  Code2,
  FileText,
  Globe,
  Layers,
  Lock,
  Search,
  Zap,
} from "lucide-react";

import type { LogoItem } from "@/components/shared";
import {
  AnimatedGradientText,
  BentoCard,
  BentoGrid,
  DotPattern,
  JsonLd,
  LogoCloud,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Link, useTranslations } from "@/lib/i18n";
import { AnimateOnScroll, CountUp, FadeIn, fadeInUp } from "@/lib/motion";
import { buildOrganizationJsonLd } from "@/lib/seo";

const LOGOS: LogoItem[] = [
  { id: "1", name: "Next.js", icon: <Blocks className="size-5" /> },
  { id: "2", name: "React", icon: <Zap className="size-5" /> },
  { id: "3", name: "TypeScript", icon: <Code2 className="size-5" /> },
  { id: "4", name: "Tailwind CSS", icon: <Layers className="size-5" /> },
  { id: "5", name: "Radix UI", icon: <Blocks className="size-5" /> },
];

const FEATURES = [
  { key: "components" as const, icon: Blocks, colSpan: 2 as const },
  { key: "hooks" as const, icon: Code2, colSpan: 1 as const },
  { key: "i18n" as const, icon: Globe, colSpan: 1 as const },
  { key: "auth" as const, icon: Lock, colSpan: 2 as const },
  { key: "forms" as const, icon: FileText, colSpan: 2 as const },
  { key: "seo" as const, icon: Search, colSpan: 1 as const },
];

const STATS = [
  { value: 78, suffix: "+", key: "components" as const },
  { value: 28, suffix: "+", key: "hooks" as const },
  { value: 50, suffix: "+", key: "utilities" as const },
  { value: 3, suffix: "", key: "locales" as const },
];

export default function LandingPage() {
  const t = useTranslations("examples");

  const jsonLd = buildOrganizationJsonLd(
    "Core Stack",
    "https://core-stack.dev",
    "https://core-stack.dev/logo.png",
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-4 py-28 text-center md:py-36">
        {/* Background gradient animado */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-primary, hsl(0 0% 9%)) 0%, transparent 70%)",
          }}
        />
        {/* Dot pattern sutil para profundidade visual */}
        <DotPattern className="-z-10 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)]" />

        <FadeIn delay={0} duration={0.5}>
          <Badge
            variant="secondary"
            className="animate-glow-pulse gap-1.5 px-4 py-1.5 text-sm"
          >
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            {t("landing.hero.badge")}
          </Badge>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6}>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            <AnimatedGradientText>
              {t("landing.hero.title")}
            </AnimatedGradientText>
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} duration={0.5}>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            {t("landing.hero.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.45} duration={0.5}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="group" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("landing.hero.cta")}
                <ArrowRight className="ml-2 size-4 transition-transform duration-normal group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/examples">{t("landing.hero.secondary")}</Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Logo Cloud */}
      <section className="border-y bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            {t("landing.logos.title")}
          </p>
          <LogoCloud logos={LOGOS} />
        </div>
      </section>

      {/* Features - BentoGrid */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landing.features.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landing.features.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <BentoGrid>
              {FEATURES.map((feature) => (
                <BentoCard
                  key={feature.key}
                  colSpan={feature.colSpan}
                  className="hover:-translate-y-1 hover:border-primary/20"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div>
                      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-normal group-hover:bg-primary/20 group-hover:scale-110">
                        <feature.icon className="size-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {t(`landing.features.${feature.key}`)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`landing.features.${feature.key}Desc`)}
                      </p>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          </AnimateOnScroll>
        </div>
      </section>

      <Separator />

      {/* Stats */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <DotPattern className="-z-10 opacity-30 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black_20%,transparent_100%)]" />
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <AnimateOnScroll
              key={stat.key}
              variants={fadeInUp}
              threshold={0.3}
              duration={0.5}
            >
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight">
                  <CountUp end={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <p className="mt-2 text-muted-foreground">
                  {t(`landing.stats.${stat.key}`)}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 100%, var(--color-primary) 0%, transparent 70%)",
          }}
        />
        <AnimateOnScroll variants={fadeInUp} threshold={0.2} duration={0.6}>
          <div className="flex flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t("landing.cta.title")}
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              {t("landing.cta.subtitle")}
            </p>
            <Button size="lg" className="group animate-glow-pulse" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("landing.cta.button")}
                <ArrowRight className="ml-2 size-4 transition-transform duration-normal group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
