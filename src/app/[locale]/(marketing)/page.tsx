"use client";

import { AboutSection } from "@/components/content/about-section";
import { ContactSection } from "@/components/content/contact-section";
import { EducationSection } from "@/components/content/education-section";
import { ExperienceSection } from "@/components/content/experience-section";
import { HeroSection } from "@/components/content/hero-section";
import { RecommendationsSection } from "@/components/content/recommendations-section";
import { TechStackSection } from "@/components/content/tech-stack-section";
import { BackToTop, JsonLd, ScrollProgress } from "@/components/shared";

import { buildPersonJsonLd } from "@/lib/seo";

export default function PortfolioPage() {
  const jsonLd = buildPersonJsonLd();

  return (
    <>
      <JsonLd data={jsonLd} />
      <ScrollProgress />

      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <EducationSection />
      <RecommendationsSection />
      <TechStackSection />
      <ContactSection />

      <BackToTop />
    </>
  );
}
