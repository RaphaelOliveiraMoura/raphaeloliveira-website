"use client";

import Image from "next/image";

import { ArrowDown, Github, Linkedin } from "lucide-react";

import { AnimatedGradientText, DotPattern } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useTranslations } from "@/lib/i18n";
import { FadeIn, TypeWriter } from "@/lib/motion";

export function HeroSection() {
  const t = useTranslations("portfolio");

  const handleScrollTo = (href: string) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-primary, hsl(0 0% 9%)) 0%, transparent 70%)",
        }}
      />
      <DotPattern className="-z-10 opacity-40 mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      {/* Grid sutil de fundo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <FadeIn delay={0.15} duration={0.6}>
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <div className="relative size-32 overflow-hidden rounded-full border-4 border-primary/20 shadow-2xl md:size-40">
            <Image
              src="/images/profile.jpeg"
              alt="Raphael de Oliveira"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 128px, 160px"
            />
          </div>
          <div className="flex flex-col items-start">
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
              <span className="size-2 animate-pulse rounded-full bg-green-500" />
              {t("hero.greeting")}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              <AnimatedGradientText>{t("hero.name")}</AnimatedGradientText>
            </h1>
            <div className="mt-2 text-xl text-muted-foreground md:text-2xl">
              <TypeWriter text={t("hero.role")} speed={80} delay={800} />
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.4} duration={0.5}>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
          {t("hero.description")}
        </p>
      </FadeIn>

      <FadeIn delay={0.55} duration={0.5}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="group" asChild>
            <a
              href="https://github.com/RaphaelOliveiraMoura"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 size-4" />
              GitHub
            </a>
          </Button>
          <Button size="lg" variant="outline" className="group" asChild>
            <a
              href="https://www.linkedin.com/in/raphaeloliveiramoura/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="mr-2 size-4" />
              LinkedIn
            </a>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => handleScrollTo("#contact")}
          >
            {t("hero.cta")}
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.7} duration={0.5}>
        <button
          onClick={() => handleScrollTo("#about")}
          className="mt-8 animate-bounce text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t("hero.scrollDown")}
        >
          <ArrowDown className="size-6" />
        </button>
      </FadeIn>
    </section>
  );
}
