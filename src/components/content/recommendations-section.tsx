"use client";

import {
  AnimatedRecommendations,
  type RecommendationItem,
} from "@/components/shared";

import { useTranslations } from "@/lib/i18n";
import { AnimateOnScroll, fadeInUp } from "@/lib/motion";

const RECOMMENDATION_KEYS = [
  "branas",
  "elemarjr",
  "akita",
  "manguinho",
  "deschamps",
  "wendel",
  "montano",
  "solto",
  "rocketseat",
] as const;

const IMAGE_MAPPING: Record<string, string> = {
  branas: "recomendations_branas.jpeg",
  elemarjr: "recomendations_elemar_jr.jpeg",
  akita: "recomendations_fabio_akita.jpeg",
  manguinho: "recomendations_manguinho.jpeg",
  deschamps: "recomendations_filipe_deschamps.jpg",
  wendel: "recomendations_erick_wendel.jpeg",
  montano: "recomendations_lucas_montano.jpeg",
  solto: "recomendations_mario_solto.jpg",
  rocketseat: "recomendations_rocketseat.jpg",
};

export function RecommendationsSection() {
  const t = useTranslations("portfolio");

  const recommendations: RecommendationItem[] = RECOMMENDATION_KEYS.map(
    (key) => ({
      id: key,
      name: t(`recommendations.items.${key}.name`),
      description: t(`recommendations.items.${key}.description`),
      image: `/images/recommendations/${IMAGE_MAPPING[key]}`,
    }),
  );

  return (
    <section
      id="recommendations"
      className="scroll-mt-20 bg-muted/30 px-4 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <AnimateOnScroll variants={fadeInUp} threshold={0.1}>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("recommendations.title")}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("recommendations.subtitle")}
            </p>
          </div>
        </AnimateOnScroll>

        <AnimatedRecommendations
          recommendations={recommendations}
          autoplay
          autoplayInterval={5000}
        />
      </div>
    </section>
  );
}
