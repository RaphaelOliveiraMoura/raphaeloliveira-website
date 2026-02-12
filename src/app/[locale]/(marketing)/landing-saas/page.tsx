"use client";

import { useState } from "react";

import {
  ArrowRight,
  Blocks,
  Cloud,
  Code2,
  Database,
  Globe,
  Layers,
  Rocket,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { FAQItem } from "@/components/shared";
import type { LogoItem } from "@/components/shared";
import type { PricingTier } from "@/components/shared";
import type { TestimonialItem } from "@/components/shared";
import {
  BackToTop,
  DotPattern,
  FAQ,
  JsonLd,
  LogoCloud,
  PricingTable,
  ScrollProgress,
  Testimonials,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  CountUp,
  FadeIn,
  fadeInUp,
  StaggerChildren,
  StaggerItem,
  TypeWriter,
} from "@/lib/motion";
import { buildOrganizationJsonLd } from "@/lib/seo";

const LOGOS: LogoItem[] = [
  { id: "1", name: "Vercel", icon: <Blocks className="size-5" /> },
  { id: "2", name: "AWS", icon: <Cloud className="size-5" /> },
  { id: "3", name: "GitHub", icon: <Code2 className="size-5" /> },
  { id: "4", name: "Supabase", icon: <Database className="size-5" /> },
  { id: "5", name: "Cloudflare", icon: <Globe className="size-5" /> },
  { id: "6", name: "PlanetScale", icon: <Layers className="size-5" /> },
];

const STATS = [
  { value: 10000, suffix: "+", key: "users" as const },
  { value: 99.9, suffix: "%", key: "uptime" as const },
  { value: 42, suffix: "+", key: "countries" as const },
  { value: 98, suffix: "%", key: "satisfaction" as const },
];

const TAB_FEATURES = {
  tab1: [
    { key: "tab1Feature1", icon: Zap },
    { key: "tab1Feature2", icon: Blocks },
    { key: "tab1Feature3", icon: Layers },
  ],
  tab2: [
    { key: "tab2Feature1", icon: Users },
    { key: "tab2Feature2", icon: Code2 },
    { key: "tab2Feature3", icon: Globe },
  ],
  tab3: [
    { key: "tab3Feature1", icon: Shield },
    { key: "tab3Feature2", icon: Database },
    { key: "tab3Feature3", icon: Cloud },
  ],
} as const;

const emailSchema = z.object({
  email: z.email(),
});

export default function LandingSaaSPage() {
  const t = useTranslations("examples");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jsonLd = buildOrganizationJsonLd(
    "SaaS Platform",
    "https://saas-platform.dev",
    "https://saas-platform.dev/logo.png",
  );

  const testimonials: TestimonialItem[] = [
    {
      id: "t1",
      quote: t("landings.saas.testimonials.t1Quote"),
      name: t("landings.saas.testimonials.t1Name"),
      role: t("landings.saas.testimonials.t1Role"),
    },
    {
      id: "t2",
      quote: t("landings.saas.testimonials.t2Quote"),
      name: t("landings.saas.testimonials.t2Name"),
      role: t("landings.saas.testimonials.t2Role"),
    },
    {
      id: "t3",
      quote: t("landings.saas.testimonials.t3Quote"),
      name: t("landings.saas.testimonials.t3Name"),
      role: t("landings.saas.testimonials.t3Role"),
    },
  ];

  const pricingTiers: PricingTier[] = [
    {
      id: "free",
      name: t("landings.saas.pricing.free"),
      description: t("landings.saas.pricing.freeDesc"),
      price: t("landings.saas.pricing.freePrice"),
      period: t("landings.saas.pricing.period"),
      ctaLabel: t("landings.saas.pricing.freeCta"),
      features: [
        { text: t("landings.saas.pricing.feat1"), included: true },
        { text: t("landings.saas.pricing.feat2"), included: true },
        { text: t("landings.saas.pricing.feat3"), included: true },
        { text: t("landings.saas.pricing.feat4"), included: false },
        { text: t("landings.saas.pricing.feat5"), included: false },
      ],
    },
    {
      id: "pro",
      name: t("landings.saas.pricing.pro"),
      description: t("landings.saas.pricing.proDesc"),
      price: t("landings.saas.pricing.proPrice"),
      period: t("landings.saas.pricing.period"),
      ctaLabel: t("landings.saas.pricing.proCta"),
      badge: t("landings.saas.pricing.proBadge"),
      features: [
        { text: t("landings.saas.pricing.feat6"), included: true },
        { text: t("landings.saas.pricing.feat7"), included: true },
        { text: t("landings.saas.pricing.feat8"), included: true },
        { text: t("landings.saas.pricing.feat4"), included: true },
        { text: t("landings.saas.pricing.feat5"), included: true },
      ],
    },
    {
      id: "enterprise",
      name: t("landings.saas.pricing.enterprise"),
      description: t("landings.saas.pricing.enterpriseDesc"),
      price: t("landings.saas.pricing.enterprisePrice"),
      period: t("landings.saas.pricing.period"),
      ctaLabel: t("landings.saas.pricing.enterpriseCta"),
      features: [
        { text: t("landings.saas.pricing.feat9"), included: true },
        { text: t("landings.saas.pricing.feat10"), included: true },
        { text: t("landings.saas.pricing.feat11"), included: true },
        { text: t("landings.saas.pricing.feat4"), included: true },
        { text: t("landings.saas.pricing.feat5"), included: true },
      ],
    },
  ];

  const faqItems: FAQItem[] = [
    {
      id: "q1",
      question: t("landings.saas.faq.q1"),
      answer: t("landings.saas.faq.a1"),
    },
    {
      id: "q2",
      question: t("landings.saas.faq.q2"),
      answer: t("landings.saas.faq.a2"),
    },
    {
      id: "q3",
      question: t("landings.saas.faq.q3"),
      answer: t("landings.saas.faq.a3"),
    },
    {
      id: "q4",
      question: t("landings.saas.faq.q4"),
      answer: t("landings.saas.faq.a4"),
    },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ email });
    if (!result.success) return;

    setIsSubmitting(true);
    // Simula envio
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setEmail("");
    toast.success(t("landings.saas.cta.success"));
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ScrollProgress />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-4 py-28 text-center md:py-36">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-primary, hsl(0 0% 9%)) 0%, transparent 70%)",
          }}
        />
        <DotPattern className="-z-10 opacity-30 [mask-image:radial-gradient(ellipse_50%_40%_at_50%_30%,black_30%,transparent_100%)]" />

        <FadeIn delay={0} duration={0.5}>
          <Badge
            variant="secondary"
            className="animate-glow-pulse px-4 py-1.5 text-sm"
          >
            <Rocket className="mr-1.5 size-3.5" />
            {t("landings.saas.hero.badge")}
          </Badge>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6}>
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            {t("landings.saas.hero.titleBefore")}
            <span className="text-primary">
              <TypeWriter
                text={t("landings.saas.hero.titleHighlight")}
                speed={40}
                delay={600}
              />
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} duration={0.5}>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            {t("landings.saas.hero.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.45} duration={0.5}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="group">
              {t("landings.saas.pricing.freeCta")}
              <ArrowRight className="ml-2 size-4 transition-transform duration-normal group-hover:translate-x-1" />
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Logo Cloud com Marquee */}
      <section className="border-y bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            {t("landings.saas.logos.title")}
          </p>
          <LogoCloud logos={LOGOS} marquee marqueeDuration={30} />
        </div>
      </section>

      {/* Features with Tabs */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.saas.features.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.saas.features.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="mx-auto mb-8 w-full sm:w-auto">
                <TabsTrigger value="tab1">
                  <Zap className="mr-1.5 size-4" />
                  {t("landings.saas.features.tab1")}
                </TabsTrigger>
                <TabsTrigger value="tab2">
                  <Users className="mr-1.5 size-4" />
                  {t("landings.saas.features.tab2")}
                </TabsTrigger>
                <TabsTrigger value="tab3">
                  <Shield className="mr-1.5 size-4" />
                  {t("landings.saas.features.tab3")}
                </TabsTrigger>
              </TabsList>

              {(["tab1", "tab2", "tab3"] as const).map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <p className="mb-8 text-center text-muted-foreground">
                    {t(`landings.saas.features.${tab}Desc`)}
                  </p>
                  <StaggerChildren
                    staggerDelay={0.1}
                    className="grid gap-6 sm:grid-cols-3"
                  >
                    {TAB_FEATURES[tab].map((feature) => (
                      <StaggerItem key={feature.key}>
                        <Card className="group transition-all duration-normal hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
                          <CardHeader>
                            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-normal group-hover:bg-primary/20 group-hover:scale-110">
                              <feature.icon className="size-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">
                              {t(`landings.saas.features.${feature.key}`)}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </TabsContent>
              ))}
            </Tabs>
          </AnimateOnScroll>
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
                  {t(`landings.saas.stats.${stat.key}`)}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      <Separator />

      {/* Testimonials */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.saas.testimonials.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.saas.testimonials.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>
          <Testimonials items={testimonials} columns={3} />
        </div>
      </section>

      <Separator />

      {/* Pricing */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.saas.pricing.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.saas.pricing.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <PricingTable tiers={pricingTiers} highlightedTier="pro" />
          </AnimateOnScroll>
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.saas.faq.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.saas.faq.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>
          <FAQ items={faqItems} />
        </div>
      </section>

      <Separator />

      {/* CTA Newsletter */}
      <section className="relative overflow-hidden">
        <AnimateOnScroll variants={fadeInUp} threshold={0.2} duration={0.6}>
          <div className="flex flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t("landings.saas.cta.title")}
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              {t("landings.saas.cta.subtitle")}
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder={t("landings.saas.cta.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="sm:w-auto"
              >
                {isSubmitting ? (
                  <span className="animate-spin">
                    <Zap className="size-4" />
                  </span>
                ) : (
                  <>
                    {t("landings.saas.cta.button")}
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
