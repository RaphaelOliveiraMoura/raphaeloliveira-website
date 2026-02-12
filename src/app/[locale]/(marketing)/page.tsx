"use client";

import {
  ArrowRight,
  Blocks,
  Code2,
  FileText,
  Globe,
  Lock,
  Search,
} from "lucide-react";

import { JsonLd } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Link, useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  CountUp,
  FadeIn,
  fadeInUp,
  StaggerChildren,
  StaggerItem,
} from "@/lib/motion";
import { buildOrganizationJsonLd } from "@/lib/seo";

const FEATURES = [
  { key: "components" as const, icon: Blocks },
  { key: "hooks" as const, icon: Code2 },
  { key: "i18n" as const, icon: Globe },
  { key: "auth" as const, icon: Lock },
  { key: "forms" as const, icon: FileText },
  { key: "seo" as const, icon: Search },
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
      <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-4 py-24 text-center md:py-32">
        {/* Background gradient animado */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-primary, hsl(0 0% 9%)) 0%, transparent 70%)",
          }}
        />

        <FadeIn delay={0} duration={0.5}>
          <Badge
            variant="secondary"
            className="animate-glow-pulse px-4 py-1.5 text-sm"
          >
            {t("landing.hero.badge")}
          </Badge>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6}>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {t("landing.hero.title")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} duration={0.5}>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            {t("landing.hero.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.45} duration={0.5}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("landing.hero.cta")}
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/examples">{t("landing.hero.secondary")}</Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      <Separator />

      {/* Features */}
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

          <StaggerChildren
            staggerDelay={0.1}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((feature) => (
              <StaggerItem key={feature.key}>
                <AnimateOnScroll
                  variants={fadeInUp}
                  threshold={0.1}
                  duration={0.4}
                >
                  <Card className="group transition-all duration-normal hover:-translate-y-1 hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-normal group-hover:bg-primary/20">
                        <feature.icon className="size-5 text-primary transition-transform duration-normal group-hover:scale-110" />
                      </div>
                      <CardTitle className="text-lg">
                        {t(`landing.features.${feature.key}`)}
                      </CardTitle>
                      <CardDescription>
                        {t(`landing.features.${feature.key}Desc`)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </AnimateOnScroll>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <Separator />

      {/* Stats */}
      <section className="px-4 py-24 md:py-32">
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
        <AnimateOnScroll variants={fadeInUp} threshold={0.2} duration={0.6}>
          <div className="flex flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t("landing.cta.title")}
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              {t("landing.cta.subtitle")}
            </p>
            <Button size="lg" className="animate-glow-pulse" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("landing.cta.button")}
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
