"use client";

import { Briefcase, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { useTranslations } from "@/lib/i18n";
import { AnimateOnScroll, fadeInUp } from "@/lib/motion";

const EXPERIENCE_KEYS = [
  "boticario",
  "natahouse_lead",
  "natahouse_dev",
  "kukac_dev",
  "kukac_intern",
] as const;

const SKILLS_MAP: Record<string, string[]> = {
  boticario: ["React", "Node.js", "TypeScript", "Next.js"],
  natahouse_lead: [
    "Docker",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "AWS",
  ],
  natahouse_dev: [
    "Docker",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
  ],
  kukac_dev: ["JavaScript", "Node.js", "IBM Watson", "Chatbot"],
  kukac_intern: ["JavaScript", "Node.js", "HTML", "CSS"],
};

interface CompanyGroup {
  company: string;
  key: string;
  roles: Array<{
    key: string;
    role: string;
    period: string;
    location: string;
    type: string;
    description: string;
  }>;
  totalPeriod: string;
  allSkills: string[];
}

function groupExperiencesByCompany(
  keys: readonly string[],
  t: ReturnType<typeof useTranslations>,
): CompanyGroup[] {
  const companyMap = new Map<string, CompanyGroup>();

  keys.forEach((key) => {
    const company = t(`experience.items.${key}.company` as never);
    const baseKey = key.replace(/_lead|_dev|_intern/, "");

    if (!companyMap.has(company)) {
      companyMap.set(company, {
        company,
        key: baseKey,
        roles: [],
        totalPeriod: "",
        allSkills: [],
      });
    }

    const group = companyMap.get(company)!;
    group.roles.push({
      key,
      role: t(`experience.items.${key}.role` as never),
      period: t(`experience.items.${key}.period` as never),
      location: t(`experience.items.${key}.location` as never),
      type: t(`experience.items.${key}.type` as never),
      description: t(`experience.items.${key}.description` as never),
    });

    // Unify skills
    if (SKILLS_MAP[key]) {
      SKILLS_MAP[key].forEach((skill) => {
        if (!group.allSkills.includes(skill)) {
          group.allSkills.push(skill);
        }
      });
    }
  });

  // Calculate total period for each company
  companyMap.forEach((group) => {
    if (group.roles.length > 1) {
      const firstPeriod = group.roles[group.roles.length - 1]?.period;
      const lastPeriod = group.roles[0]?.period;
      if (firstPeriod && lastPeriod) {
        const startDate = firstPeriod.split(" - ")[0];
        const endDate = lastPeriod.split(" - ")[1];
        group.totalPeriod = `${startDate} - ${endDate}`;
      }
    } else if (group.roles[0]) {
      group.totalPeriod = group.roles[0].period;
    }
  });

  return Array.from(companyMap.values());
}

export function ExperienceSection() {
  const t = useTranslations("portfolio");
  const companyGroups = groupExperiencesByCompany(EXPERIENCE_KEYS, t);

  return (
    <section
      id="experience"
      className="scroll-mt-20 bg-muted/30 px-4 py-24 md:py-32"
    >
      <div className="mx-auto max-w-4xl">
        <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("experience.title")}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("experience.subtitle")}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-px" />

          <div className="space-y-12">
            {companyGroups.map((group, idx) => {
              const isLeft = idx % 2 === 0;

              return (
                <AnimateOnScroll
                  key={group.company}
                  variants={fadeInUp}
                  threshold={0.1}
                  delay={idx * 0.1}
                >
                  <div className="relative flex items-start gap-6 md:gap-0">
                    {/* Timeline dot */}
                    <div className="absolute left-4 z-10 flex size-3 -translate-x-1/2 items-center justify-center md:left-1/2">
                      <span className="size-3 rounded-full border-2 border-primary bg-background" />
                    </div>

                    {/* Company Group */}
                    <div
                      className={`ml-10 w-full md:ml-0 md:w-[calc(50%-2rem)] ${
                        isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                      }`}
                    >
                      {/* Company Header */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-bold text-primary">
                            {group.company}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {group.totalPeriod}
                          </p>
                        </div>
                        <Briefcase className="size-5 shrink-0 text-muted-foreground" />
                      </div>

                      {/* Roles */}
                      <div className="space-y-3">
                        {group.roles.map((role) => (
                          <div
                            key={role.key}
                            className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <div className="mb-2">
                              <h4 className="font-semibold text-sm">
                                {role.role}
                              </h4>
                            </div>

                            <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>{role.period}</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {role.location}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {role.type}
                              </Badge>
                            </div>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {role.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Unified Skills */}
                      {group.allSkills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {group.allSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
