import { Building2, Palette, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getTranslations, Link } from "@/lib/i18n";

const LANDINGS = [
  {
    key: "saas" as const,
    icon: Building2,
    href: "/landing-saas",
    components: [
      "TypeWriter",
      "Tabs",
      "PricingTable",
      "FAQ",
      "Testimonials",
      "LogoCloud",
      "Form",
    ],
  },
  {
    key: "startup" as const,
    icon: Rocket,
    href: "/landing-startup",
    components: [
      "SlideIn",
      "ResponsiveImage",
      "CountUp",
      "LogoCloud",
      "Testimonials",
      "Form",
    ],
  },
  {
    key: "portfolio" as const,
    icon: Palette,
    href: "/landing-portfolio",
    components: [
      "Countdown",
      "Lightbox",
      "FAQ",
      "Avatar",
      "ScaleOnHover",
      "Form",
    ],
  },
];

export default async function LandingsIndexPage() {
  const t = await getTranslations("examples");

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 md:py-32">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("landings.index.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("landings.index.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {LANDINGS.map((landing) => (
          <Link key={landing.key} href={landing.href} className="group">
            <Card className="h-full transition-all duration-normal group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-normal group-hover:bg-primary/20">
                  <landing.icon className="size-6 text-primary" />
                </div>
                <CardTitle className="text-lg">
                  {t(`landings.index.${landing.key}`)}
                </CardTitle>
                <CardDescription>
                  {t(`landings.index.${landing.key}Desc`)}
                </CardDescription>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {landing.components.map((comp) => (
                    <Badge
                      key={comp}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {comp}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
