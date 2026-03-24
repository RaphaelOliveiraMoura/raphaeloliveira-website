"use client";

import { AboutSection } from "@/components/content/about-section";
import { ContactSection } from "@/components/content/contact-section";
import { EducationSection } from "@/components/content/education-section";
import { ExperienceSection } from "@/components/content/experience-section";
import { HeroSection } from "@/components/content/hero-section";
import { ProjectsSection } from "@/components/content/projects-section";
import { RecommendationsSection } from "@/components/content/recommendations-section";
import { BackToTop, JsonLd, ScrollProgress } from "@/components/shared";

import { buildPersonJsonLd } from "@/lib/seo";

export default function PortfolioPage() {
  const jsonLd = buildPersonJsonLd();

  return (
    <>
      <JsonLd data={jsonLd} />
      <ScrollProgress />

      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <ExperienceSection />
      <EducationSection />
      <RecommendationsSection />
      <ContactSection />

      <BackToTop className="fixed bottom-8 right-12" />
    </>
  );
}
