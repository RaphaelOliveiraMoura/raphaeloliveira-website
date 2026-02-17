"use client";

import { Github, Linkedin, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useTranslations } from "@/lib/i18n";
import { AnimateOnScroll, FadeIn, fadeInUp } from "@/lib/motion";

const CONTACT_LINKS = [
  {
    href: "mailto:raphael.moura0208@gmail.com",
    icon: Mail,
    key: "email" as const,
  },
  {
    href: "https://github.com/RaphaelOliveiraMoura",
    icon: Github,
    key: "github" as const,
    external: true,
  },
  {
    href: "https://www.linkedin.com/in/raphaeloliveiramoura/",
    icon: Linkedin,
    key: "linkedin" as const,
    external: true,
  },
];

export function ContactSection() {
  const t = useTranslations("portfolio");

  return (
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden bg-muted/30"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, var(--color-primary) 0%, transparent 70%)",
        }}
      />

      <AnimateOnScroll variants={fadeInUp} threshold={0.2} duration={0.6}>
        <div className="flex flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("contact.title")}
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t("contact.subtitle")}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            {CONTACT_LINKS.map((link, idx) => (
              <FadeIn key={link.key} delay={0.1 + idx * 0.1} duration={0.5}>
                <Button
                  size="lg"
                  variant={idx === 0 ? "default" : "outline"}
                  className="group w-full sm:w-auto"
                  asChild
                >
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    <link.icon className="mr-2 size-4" />
                    {t(`contact.${link.key}`)}
                  </a>
                </Button>
              </FadeIn>
            ))}
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
