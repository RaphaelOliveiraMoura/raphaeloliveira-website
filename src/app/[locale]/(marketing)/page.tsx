import {
  ArrowRight,
  Blocks,
  Code2,
  FileText,
  Globe,
  Lock,
  Search,
} from "lucide-react";

import { JsonLd } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getTranslations, Link } from "@/lib/i18n";
import { buildOrganizationJsonLd } from "@/lib/seo";

const FEATURES = [
  { key: "components" as const, icon: Blocks },
  { key: "hooks" as const, icon: Code2 },
  { key: "i18n" as const, icon: Globe },
  { key: "auth" as const, icon: Lock },
  { key: "forms" as const, icon: FileText },
  { key: "seo" as const, icon: Search },
];

const STATS = [
  { value: "78+", key: "components" as const },
  { value: "28+", key: "hooks" as const },
  { value: "50+", key: "utilities" as const },
  { value: "3", key: "locales" as const },
];

export default async function LandingPage() {
  const t = await getTranslations("examples");

  const jsonLd = buildOrganizationJsonLd(
    "Core Stack",
    "https://core-stack.dev",
    "https://core-stack.dev/logo.png",
  );

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-32">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
          {t("landing.hero.badge")}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          {t("landing.hero.title")}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t("landing.hero.subtitle")}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("landing.hero.cta")}
              <ArrowRight className="ml-2 size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/examples">{t("landing.hero.secondary")}</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("landing.features.subtitle")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.key}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">
                    {t(`landing.features.${feature.key}`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`landing.features.${feature.key}Desc`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Stats */}
      <section className="px-4 py-24 md:py-32">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="text-4xl font-bold tracking-tight">
                {stat.value}
              </div>
              <p className="mt-2 text-muted-foreground">
                {t(`landing.stats.${stat.key}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="flex flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("landing.cta.title")}
        </h2>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t("landing.cta.subtitle")}
        </p>
        <Button size="lg" asChild>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("landing.cta.button")}
            <ArrowRight className="ml-2 size-4" />
          </a>
        </Button>
      </section>
    </>
  );
}
