"use client";

import { useState } from "react";

import {
  ArrowRight,
  BarChart3,
  Blocks,
  Layers,
  Lock,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { LogoItem } from "@/components/shared";
import type { TestimonialItem } from "@/components/shared";
import {
  BackToTop,
  BorderBeam,
  JsonLd,
  LogoCloud,
  Testimonials,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  CountUp,
  FadeIn,
  fadeInUp,
  SlideIn,
} from "@/lib/motion";
import { buildOrganizationJsonLd } from "@/lib/seo";

const LOGOS: LogoItem[] = [
  { id: "1", name: "Y Combinator", icon: <Sparkles className="size-5" /> },
  { id: "2", name: "Sequoia", icon: <Layers className="size-5" /> },
  { id: "3", name: "a16z", icon: <Blocks className="size-5" /> },
  { id: "4", name: "Accel", icon: <Zap className="size-5" /> },
];

const STATS = [
  { value: 12000, suffix: "+", key: "projects" as const },
  { value: 850, suffix: "+", key: "teams" as const },
  { value: 500000, suffix: "+", key: "tasks" as const },
  { value: 2400, suffix: "+", key: "hours" as const },
];

const FEATURES = [
  {
    key: "f1" as const,
    icon: BarChart3,
    image: "https://placehold.co/600x400/f0f0f5/4a4a5a?text=Dashboards",
  },
  {
    key: "f2" as const,
    icon: MessageSquare,
    image: "https://placehold.co/600x400/eef0f5/4a4a5a?text=Collaboration",
  },
  {
    key: "f3" as const,
    icon: Zap,
    image: "https://placehold.co/600x400/f0eef5/4a4a5a?text=Automations",
  },
  {
    key: "f4" as const,
    icon: Lock,
    image: "https://placehold.co/600x400/eef2f0/4a4a5a?text=Security",
  },
];

const emailSchema = z.object({
  email: z.email(),
});

export default function LandingStartupPage() {
  const t = useTranslations("examples");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jsonLd = buildOrganizationJsonLd(
    "Startup App",
    "https://startup-app.dev",
    "https://startup-app.dev/logo.png",
  );

  const testimonials: TestimonialItem[] = [
    {
      id: "t1",
      quote: t("landings.startup.testimonials.t1Quote"),
      name: t("landings.startup.testimonials.t1Name"),
      role: t("landings.startup.testimonials.t1Role"),
    },
    {
      id: "t2",
      quote: t("landings.startup.testimonials.t2Quote"),
      name: t("landings.startup.testimonials.t2Name"),
      role: t("landings.startup.testimonials.t2Role"),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ email });
    if (!result.success) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setEmail("");
    toast.success(t("landings.startup.cta.success"));
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-4 py-24 text-center md:py-36">
        {/* Camada de gradiente principal — brilho suave irradiando do centro-topo */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.65 0.05 260 / 0.15) 0%, transparent 70%)",
          }}
        />
        {/* Segundo brilho sutil no canto inferior para dar profundidade */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 70% 100%, oklch(0.7 0.04 300 / 0.08) 0%, transparent 60%)",
          }}
        />
        {/* Grid sutil de fundo */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <FadeIn delay={0} duration={0.5}>
          <Badge variant="outline" className="gap-1.5 px-4 py-1.5 text-sm">
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            {t("landings.startup.hero.badge")}
          </Badge>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6}>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {t("landings.startup.hero.title")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} duration={0.5}>
          <p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
            {t("landings.startup.hero.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.45} duration={0.5}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="group">
              {t("landings.startup.hero.cta")}
              <ArrowRight className="ml-2 size-4 transition-transform duration-normal group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              {t("landings.startup.hero.secondary")}
            </Button>
          </div>
        </FadeIn>

        {/* Hero mockup image com BorderBeam */}
        <FadeIn delay={0.6} duration={0.8}>
          <div className="relative mt-8 w-full max-w-4xl overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-2xl ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
            <BorderBeam size={600} duration={8} borderWidth={3} />
            {/* eslint-disable-next-line @next/next/no-img-element -- placeholder demo image */}
            <img
              src="https://placehold.co/1200x600/f4f4f8/5a5a6a?text=App+Dashboard"
              alt="App Dashboard Preview"
              className="w-full rounded-[inherit]"
            />
          </div>
        </FadeIn>
      </section>

      {/* Logo Cloud */}
      <section className="border-y bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            {t("landings.startup.logos.title")}
          </p>
          <LogoCloud logos={LOGOS} />
        </div>
      </section>

      {/* Alternating Features */}
      <section className="relative px-4 py-24 md:py-32">
        {/* Brilho de fundo sutil na secao de features */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 50%, oklch(0.65 0.04 260 / 0.06) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-20 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.startup.features.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.startup.features.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="flex flex-col gap-24">
            {FEATURES.map((feature, idx) => {
              const isReversed = idx % 2 !== 0;
              return (
                <div
                  key={feature.key}
                  className={`flex flex-col items-center gap-8 md:gap-12 ${
                    isReversed ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  <SlideIn
                    direction={isReversed ? "right" : "left"}
                    distance={40}
                    className="flex-1"
                  >
                    <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/40 shadow-md ring-1 ring-black/[0.02] dark:bg-muted/20 dark:ring-white/[0.03]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- placeholder demo image */}
                      <img
                        src={feature.image}
                        alt={t(`landings.startup.features.${feature.key}Title`)}
                        className="w-full"
                      />
                    </div>
                  </SlideIn>
                  <SlideIn
                    direction={isReversed ? "left" : "right"}
                    distance={40}
                    className="flex flex-1 flex-col justify-center"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/5">
                      <feature.icon className="size-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      {t(`landings.startup.features.${feature.key}Title`)}
                    </h3>
                    <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                      {t(`landings.startup.features.${feature.key}Desc`)}
                    </p>
                  </SlideIn>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* Stats */}
      <section className="bg-muted/20 px-4 py-24 md:py-32">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <AnimateOnScroll
              key={stat.key}
              variants={fadeInUp}
              threshold={0.3}
              duration={0.5}
            >
              <div className="text-center">
                <div className="text-4xl font-bold tracking-tight">
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                </div>
                <p className="mt-2 text-muted-foreground">
                  {t(`landings.startup.stats.${stat.key}`)}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      <Separator />

      {/* Testimonials */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.startup.testimonials.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.startup.testimonials.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>
          <Testimonials items={testimonials} columns={2} />
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
              {t("landings.startup.cta.title")}
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              {t("landings.startup.cta.subtitle")}
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder={t("landings.startup.cta.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="animate-spin">
                    <Zap className="size-4" />
                  </span>
                ) : (
                  <>
                    {t("landings.startup.cta.button")}
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </AnimateOnScroll>
      </section>

      <BackToTop className="fixed right-6 bottom-6 z-50" />
    </>
  );
}
