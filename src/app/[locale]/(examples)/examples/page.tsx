import {
  Blocks,
  Code2,
  Database,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getTranslations } from "@/lib/i18n";

const EXAMPLES = [
  {
    key: "componentsGallery" as const,
    icon: Blocks,
    href: "/examples/components",
  },
  { key: "hooksPlayground" as const, icon: Code2, href: "/examples/hooks" },
  { key: "dashboard" as const, icon: LayoutDashboard, href: "/dashboard" },
  { key: "dataManagement" as const, icon: Database, href: "/dashboard/data" },
  { key: "forms" as const, icon: FileText, href: "/dashboard/forms" },
  { key: "settings" as const, icon: Settings, href: "/dashboard/settings" },
  {
    key: "animations" as const,
    icon: Sparkles,
    href: "/examples/animations",
  },
];

export default async function ExamplesIndexPage() {
  const t = await getTranslations("examples");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("index.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("index.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((example) => (
          <a key={example.key} href={example.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <example.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">
                  {t(`index.${example.key}`)}
                </CardTitle>
                <CardDescription>
                  {t(`index.${example.key}Desc`)}
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
