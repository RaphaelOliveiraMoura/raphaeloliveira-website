"use client";

import { MapPin } from "lucide-react";

import { useTranslations } from "@/lib/i18n";
import { AnimateOnScroll, CountUp, FadeIn, fadeInUp } from "@/lib/motion";

import { Marquee, ResponsiveImage } from "../shared";

interface TechItem {
  name: string;
  icon: string;
}

const FRONTEND_TECHS: TechItem[] = [
  { name: "React", icon: "/images/techs/react.svg" },
  { name: "Next.js", icon: "/images/techs/nextdotjs.svg" },
  { name: "TypeScript", icon: "/images/techs/typescript.svg" },
  { name: "JavaScript", icon: "/images/techs/javascript.svg" },
  { name: "Figma", icon: "/images/techs/figma.svg" },
];

const BACKEND_TECHS: TechItem[] = [
  { name: "Node.js", icon: "/images/techs/nodedotjs.svg" },
  { name: "NestJS", icon: "/images/techs/nestjs.svg" },
  { name: "PostgreSQL", icon: "/images/techs/postgresql.svg" },
  { name: "DynamoDB", icon: "/images/techs/amazondynamodb.svg" },
];

const DEVOPS_TECHS: TechItem[] = [
  { name: "Docker", icon: "/images/techs/docker.svg" },
  { name: "AWS", icon: "/images/techs/amazonwebservices.svg" },
];

const ALL_TECHS: TechItem[] = [
  ...FRONTEND_TECHS,
  ...BACKEND_TECHS,
  ...DEVOPS_TECHS,
];

function calculateYearsOfExperience(): number {
  const start = new Date(2019, 2, 1); // mar/2019
  const now = new Date();
  return Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

export function AboutSection() {
  const t = useTranslations("portfolio");
  const yearsOfExperience = calculateYearsOfExperience();

  const timelineItems = [t("about.bio1"), t("about.bio2"), t("about.bio3")];

  const stats = [
    {
      value: yearsOfExperience,
      suffix: "+",
      label: t("about.yearsExperience"),
    },
    { value: 30, suffix: "+", label: t("about.projectsDelivered") },
    { value: 4, suffix: "", label: t("about.companiesWorked") },
  ];

  return (
    <section id="about" className="scroll-mt-20 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("about.title")}
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-3 min-w-0">
            <AnimateOnScroll variants={fadeInUp} threshold={0.1} delay={0.1}>
              <div className="space-y-4">
                <ol className="relative space-y-6 border-l border-border/60 pl-6">
                  {timelineItems.map((item, idx) => (
                    <li key={item} className="relative">
                      <span className="absolute -left-2.25 top-2.5 size-4 rounded-full border border-primary/40 bg-background" />
                      <div className="flex items-start gap-4">
                        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="min-w-0 flex-1 text-base leading-relaxed text-muted-foreground">
                          {item}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </AnimateOnScroll>
          </div>

          <div className="md:col-span-2 min-w-0">
            <AnimateOnScroll
              variants={fadeInUp}
              threshold={0.1}
              delay={0.2}
              className="grid gap-4"
            >
              {stats.map((stat, idx) => (
                <FadeIn
                  key={stat.label}
                  delay={0.2 + idx * 0.15}
                  duration={0.5}
                >
                  <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold tracking-tight text-primary">
                      <CountUp
                        end={stat.value}
                        suffix={stat.suffix}
                        duration={2}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </AnimateOnScroll>
          </div>
        </div>
      </div>

      <AnimateOnScroll
        variants={fadeInUp}
        threshold={0.1}
        delay={0.1}
        className="mt-10"
      >
        <div>
          <Marquee duration={34} className="[--gap:1rem]">
            {ALL_TECHS.map((tech) => (
              <TechMarqueeItem key={tech.name} tech={tech} />
            ))}
          </Marquee>
        </div>
      </AnimateOnScroll>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        <span>{t("about.location")}</span>
      </div>
    </section>
  );
}

function TechMarqueeItem({ tech }: { tech: TechItem }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground">
      <span className="flex size-8 items-center justify-center rounded-full bg-muted/40">
        <ResponsiveImage
          src={tech.icon}
          alt={tech.name}
          width={18}
          height={18}
          className="size-4 opacity-90"
        />
      </span>
      <span className="font-medium">{tech.name}</span>
    </div>
  );
}
