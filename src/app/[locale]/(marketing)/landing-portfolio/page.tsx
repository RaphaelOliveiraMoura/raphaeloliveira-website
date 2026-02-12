"use client";

import { useState } from "react";

import {
  ArrowRight,
  Calendar,
  Linkedin,
  MapPin,
  Mic2,
  Ticket,
  Twitter,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { FAQItem } from "@/components/shared";
import {
  BackToTop,
  Countdown,
  DotPattern,
  FAQ,
  JsonLd,
  Lightbox,
  ScrollProgress,
} from "@/components/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  FadeIn,
  fadeInUp,
  ScaleOnHover,
  StaggerChildren,
  StaggerItem,
} from "@/lib/motion";
import { buildOrganizationJsonLd } from "@/lib/seo";

// Data do evento: 3 meses a partir de agora
const EVENT_DATE = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

const GALLERY_IMAGES = [
  {
    src: "https://placehold.co/800x600/2d1b69/e0e0e0?text=Talk+1",
    alt: "Palestra principal",
  },
  {
    src: "https://placehold.co/800x600/1b3a69/e0e0e0?text=Workshop",
    alt: "Workshop",
  },
  {
    src: "https://placehold.co/800x600/1b694c/e0e0e0?text=Networking",
    alt: "Networking",
  },
  {
    src: "https://placehold.co/800x600/69491b/e0e0e0?text=Talk+2",
    alt: "Palestra",
  },
  {
    src: "https://placehold.co/800x600/691b3a/e0e0e0?text=Panel",
    alt: "Painel",
  },
  {
    src: "https://placehold.co/800x600/3a1b69/e0e0e0?text=Awards",
    alt: "Premiacao",
  },
];

const SPEAKERS = [
  {
    key: "s1" as const,
    fallback: "FL",
    color: "bg-violet-500/20 text-violet-600",
  },
  { key: "s2" as const, fallback: "RT", color: "bg-blue-500/20 text-blue-600" },
  {
    key: "s3" as const,
    fallback: "CR",
    color: "bg-emerald-500/20 text-emerald-600",
  },
  {
    key: "s4" as const,
    fallback: "LM",
    color: "bg-amber-500/20 text-amber-600",
  },
];

const STEPS = [
  { key: "step1" as const, icon: Ticket, number: "01" },
  { key: "step2" as const, icon: Mic2, number: "02" },
  { key: "step3" as const, icon: Users, number: "03" },
];

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
});

export default function LandingPortfolioPage() {
  const t = useTranslations("examples");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jsonLd = buildOrganizationJsonLd(
    "Design & Tech Summit",
    "https://designtechsummit.dev",
    "https://designtechsummit.dev/logo.png",
  );

  const faqItems: FAQItem[] = [
    {
      id: "q1",
      question: t("landings.portfolio.faq.q1"),
      answer: t("landings.portfolio.faq.a1"),
    },
    {
      id: "q2",
      question: t("landings.portfolio.faq.q2"),
      answer: t("landings.portfolio.faq.a2"),
    },
    {
      id: "q3",
      question: t("landings.portfolio.faq.q3"),
      answer: t("landings.portfolio.faq.a3"),
    },
    {
      id: "q4",
      question: t("landings.portfolio.faq.q4"),
      answer: t("landings.portfolio.faq.a4"),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setFormData({ name: "", email: "", phone: "", company: "", role: "" });
    toast.success(t("landings.portfolio.contact.success"));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ScrollProgress />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center gap-8 overflow-hidden px-4 py-28 text-center md:py-40">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 30% 10%, oklch(0.6 0.2 280) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 70% 80%, oklch(0.5 0.15 200) 0%, transparent 50%)",
          }}
        />
        <DotPattern className="-z-10 opacity-30 [mask-image:radial-gradient(ellipse_50%_40%_at_50%_50%,black_20%,transparent_100%)]" />

        <FadeIn delay={0} duration={0.5}>
          <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
            <Calendar className="size-3.5" />
            {t("landings.portfolio.hero.badge")}
          </Badge>
        </FadeIn>

        <FadeIn delay={0.15} duration={0.6}>
          <h1 className="max-w-4xl text-balance text-5xl font-bold tracking-tight md:text-7xl">
            {t("landings.portfolio.hero.title")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.3} duration={0.5}>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            {t("landings.portfolio.hero.subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.45} duration={0.5}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            <span>São Paulo, Brasil</span>
          </div>
        </FadeIn>
      </section>

      {/* Countdown */}
      <section className="border-y bg-muted/20 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <h2 className="mb-8 text-center text-xl font-semibold">
              {t("landings.portfolio.countdown.title")}
            </h2>
          </AnimateOnScroll>
          <Countdown
            targetDate={EVENT_DATE}
            labels={{
              days: t("landings.portfolio.countdown.days"),
              hours: t("landings.portfolio.countdown.hours"),
              minutes: t("landings.portfolio.countdown.minutes"),
              seconds: t("landings.portfolio.countdown.seconds"),
            }}
          />
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.portfolio.gallery.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.portfolio.gallery.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren
            staggerDelay={0.08}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {GALLERY_IMAGES.map((image, idx) => (
              <StaggerItem key={idx}>
                <button
                  onClick={() => openLightbox(idx)}
                  className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- placeholder gallery image */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-normal group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-normal group-hover:bg-black/20" />
                </button>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <Lightbox
            images={GALLERY_IMAGES}
            initialIndex={lightboxIndex}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
          />
        </div>
      </section>

      <Separator />

      {/* Process / How it works */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.portfolio.process.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.portfolio.process.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 hidden h-full w-px bg-border md:left-1/2 md:block" />

            <div className="flex flex-col gap-12">
              {STEPS.map((step, idx) => (
                <AnimateOnScroll
                  key={step.key}
                  variants={fadeInUp}
                  threshold={0.2}
                  delay={idx * 0.15}
                >
                  <div
                    className={`flex flex-col gap-6 md:flex-row md:items-center ${
                      idx % 2 !== 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-1 ${idx % 2 !== 0 ? "md:text-right" : ""}`}
                    >
                      <Card>
                        <CardHeader>
                          <div className="mb-2 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                              <step.icon className="size-5 text-primary" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {step.number}
                            </span>
                          </div>
                          <CardTitle className="text-lg">
                            {t(`landings.portfolio.process.${step.key}Title`)}
                          </CardTitle>
                          <CardDescription>
                            {t(`landings.portfolio.process.${step.key}Desc`)}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                    {/* Center dot */}
                    <div className="relative z-10 hidden size-4 shrink-0 rounded-full border-2 border-primary bg-background md:block" />
                    <div className="hidden flex-1 md:block" />
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Speakers */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.portfolio.team.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.portfolio.team.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren
            staggerDelay={0.1}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {SPEAKERS.map((speaker) => (
              <StaggerItem key={speaker.key}>
                <ScaleOnHover scale={1.03}>
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center gap-4 p-6">
                      <Avatar size="lg" className="size-20">
                        <AvatarFallback className={`text-lg ${speaker.color}`}>
                          {speaker.fallback}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {t(`landings.portfolio.team.${speaker.key}Name`)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t(`landings.portfolio.team.${speaker.key}Role`)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Twitter className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Linkedin className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-16 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.portfolio.faq.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.portfolio.faq.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>
          <FAQ items={faqItems} />
        </div>
      </section>

      <Separator />

      {/* Contact / Registration Form */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-xl">
          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("landings.portfolio.contact.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("landings.portfolio.contact.subtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-name"
                      className="text-sm font-medium"
                    >
                      {t("landings.portfolio.contact.name")}
                    </label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-email"
                      className="text-sm font-medium"
                    >
                      {t("landings.portfolio.contact.email")}
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-phone"
                      className="text-sm font-medium"
                    >
                      {t("landings.portfolio.contact.phone")}
                    </label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-company"
                        className="text-sm font-medium"
                      >
                        {t("landings.portfolio.contact.company")}
                      </label>
                      <Input
                        id="contact-company"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-role"
                        className="text-sm font-medium"
                      >
                        {t("landings.portfolio.contact.role")}
                      </label>
                      <Input
                        id="contact-role"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="animate-spin">
                        <Ticket className="size-4" />
                      </span>
                    ) : (
                      <>
                        {t("landings.portfolio.contact.button")}
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
      </section>

      <BackToTop className="fixed right-6 bottom-6 z-50" />
    </>
  );
}
