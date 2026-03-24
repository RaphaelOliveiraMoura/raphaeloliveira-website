"use client";

import { motion } from "framer-motion";
import {
  Braces,
  ExternalLink,
  Gamepad2,
  LucideIcon,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { useTranslations } from "@/lib/i18n";
import {
  AnimateOnScroll,
  fadeInUp,
  StaggerChildren,
  StaggerItem,
} from "@/lib/motion";

import { BentoCard, BentoGrid, BorderBeam, ResponsiveImage } from "../shared";

const PROJECT_KEYS = [
  "matchMoment",
  "itoOnline",
  "huntspace",
  "barcaApi",
] as const;

interface ProjectData {
  url: string;
  displayUrl: string;
  tech: string[];
  colSpan: 1 | 2;
  featured: boolean;
  icon: LucideIcon;
  gradient: string;
  iconGradient: string;
  beamColors?: { from: string; to: string };
  image?: string;
}

const PROJECTS_DATA: Record<(typeof PROJECT_KEYS)[number], ProjectData> = {
  matchMoment: {
    url: "https://www.match-moment.com/",
    displayUrl: "match-moment.com",
    tech: ["Next.js", "React", "TypeScript"],
    colSpan: 2,
    featured: true,
    icon: Gamepad2,
    gradient: "linear-gradient(135deg, #f97316 0%, #a855f7 60%, #6d28d9 100%)",
    iconGradient: "linear-gradient(135deg, #f97316, #a855f7)",
    beamColors: { from: "#ffaa40", to: "#9c40ff" },
    image: "/images/projects/match-moment.png",
  },
  itoOnline: {
    url: "https://www.playito.io/pt-BR",
    displayUrl: "playito.io",
    tech: ["Next.js", "React", "WebSocket", "TypeScript"],
    colSpan: 1,
    featured: false,
    icon: Users,
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 60%, #0891b2 100%)",
    iconGradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    image: "/images/projects/ito-online.png",
  },
  huntspace: {
    url: "https://www.huntspace.dev/",
    displayUrl: "huntspace.dev",
    tech: ["React Native", "Next.js", "Supabase"],
    colSpan: 1,
    featured: false,
    icon: Trophy,
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)",
    iconGradient: "linear-gradient(135deg, #10b981, #0d9488)",
    image: "/images/projects/huntspace.png",
  },
  barcaApi: {
    url: "https://api.fc-barcelona.app/",
    displayUrl: "api.fc-barcelona.app",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM"],
    colSpan: 2,
    featured: true,
    icon: Braces,
    gradient: "linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #dc2626 100%)",
    iconGradient: "linear-gradient(135deg, #2563eb, #dc2626)",
    beamColors: { from: "#40c9ff", to: "#e81cff" },
    image: "/images/projects/barca-api.png",
  },
};

function ProjectCard({
  projectKey,
  t,
}: {
  projectKey: (typeof PROJECT_KEYS)[number];
  t: ReturnType<typeof useTranslations>;
}) {
  const data = PROJECTS_DATA[projectKey];
  const Icon = data.icon;
  const name = t(`projects.items.${projectKey}.name`);
  const description = t(`projects.items.${projectKey}.description`);
  const category = t(`projects.items.${projectKey}.category`);
  const hasImage = data.image !== undefined && typeof window !== "undefined";

  return (
    <StaggerItem>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="h-full"
      >
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block h-full"
          aria-label={`${name} — ${t("projects.visitProject")}`}
        >
          <BentoCard
            colSpan={data.colSpan}
            className="h-full p-0 hover:shadow-xl"
          >
            {/* Browser chrome bar */}
            <div className="flex shrink-0 items-center gap-1.5 border-b bg-muted/50 px-3 py-2.5">
              <div className="size-2.5 rounded-full bg-red-400/80" />
              <div className="size-2.5 rounded-full bg-yellow-400/80" />
              <div className="size-2.5 rounded-full bg-green-400/80" />
              <div className="ml-2 flex-1 overflow-hidden rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground/70">
                <span className="block truncate">{data.displayUrl}</span>
              </div>
              <ExternalLink className="size-3 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
            </div>

            {/* Screenshot / gradient placeholder */}
            <div className="relative h-44 shrink-0 overflow-hidden">
              {hasImage ? (
                <ResponsiveImage
                  src={data.image!}
                  alt={name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: data.gradient }}
                >
                  <Icon
                    className="size-28 text-white/10 transition-transform duration-500 group-hover:scale-110"
                    strokeWidth={1}
                  />
                </div>
              )}
              {/* Fade at bottom to blend into card */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
                    style={{ background: data.iconGradient }}
                  >
                    <Icon className="size-4 text-white" />
                  </div>
                  <h3 className="font-semibold leading-tight">{name}</h3>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {category}
                </Badge>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>

              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {data.tech.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {data.featured && data.beamColors && (
              <BorderBeam
                colorFrom={data.beamColors.from}
                colorTo={data.beamColors.to}
                duration={8}
                size={15}
              />
            )}
          </BentoCard>
        </a>
      </motion.div>
    </StaggerItem>
  );
}

export function ProjectsSection() {
  const t = useTranslations("portfolio");

  return (
    <section id="projects" className="scroll-mt-20 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("projects.title")}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("projects.subtitle")}
            </p>
          </div>
        </AnimateOnScroll>

        <StaggerChildren staggerDelay={0.12}>
          <BentoGrid>
            {PROJECT_KEYS.map((key) => (
              <ProjectCard key={key} projectKey={key} t={t} />
            ))}
          </BentoGrid>
        </StaggerChildren>
      </div>
    </section>
  );
}
