"use client";

import { useState } from "react";

import {
  Activity,
  DollarSign,
  FileText,
  Info,
  TrendingUp,
  Users,
} from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import {
  EmptyState,
  Feature,
  SkeletonCard,
  SkeletonText,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  useDateFormatter,
  useNumberFormatter,
  useTranslations,
} from "@/lib/i18n";
import { MOCK_DASHBOARD_STATS } from "@/lib/utils/mock-data";
import { useFeatureFlag, useIsMobile } from "@/hooks";

import { useAuth } from "@/providers/auth-provider";

const STAT_ICONS = {
  totalUsers: Users,
  totalPosts: FileText,
  activeNow: Activity,
  revenue: DollarSign,
} as const;

const STAT_PROGRESS = {
  totalUsers: 78,
  totalPosts: 62,
  activeNow: 45,
  revenue: 89,
} as const;

function calculateChange(current: number, previous: number): string {
  const change = ((current - previous) / previous) * 100;
  return `+${change.toFixed(1)}%`;
}

export default function DashboardPage() {
  const t = useTranslations("common");
  const te = useTranslations("examples");
  const { user } = useAuth();
  const { currency, number } = useNumberFormatter();
  const { relative } = useDateFormatter();
  const isMobile = useIsMobile();
  const showBeta = useFeatureFlag("betaFeatures");
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const formatStatValue = (key: string, value: number) => {
    if (key === "revenue") return currency(value);
    return number(value);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.welcomeBack", { name: user?.name ?? "User" })}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.overview")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Feature flag="betaFeatures" fallback={null}>
            <Badge variant="secondary">Beta</Badge>
          </Feature>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {relative(new Date())}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
          <TabsTrigger value="activity">
            {t("dashboard.recentActivity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_DASHBOARD_STATS.map((stat) => {
                const Icon =
                  STAT_ICONS[stat.key as keyof typeof STAT_ICONS] ?? Activity;
                const progress =
                  STAT_PROGRESS[stat.key as keyof typeof STAT_PROGRESS] ?? 50;

                return (
                  <Card key={stat.key}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t(
                          `dashboard.${stat.key}` as
                            | "dashboard.totalUsers"
                            | "dashboard.totalPosts"
                            | "dashboard.activeNow"
                            | "dashboard.revenue",
                        )}
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icon className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {t(
                            `dashboard.${stat.key}` as
                              | "dashboard.totalUsers"
                              | "dashboard.totalPosts"
                              | "dashboard.activeNow"
                              | "dashboard.revenue",
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold">
                        {formatStatValue(stat.key, stat.value)}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="size-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          {calculateChange(stat.value, stat.previousValue)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Info */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{te("data.title")}</CardTitle>
                  <Badge variant="outline">
                    {isMobile ? "Mobile" : "Desktop"}
                  </Badge>
                </div>
                <CardDescription>{te("data.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonText lines={3} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {te("data.name")}
                      </span>
                      <span className="font-medium">
                        20{" "}
                        {t("itemsCount", { count: 20 })
                          .split(" ")
                          .slice(1)
                          .join(" ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {te("data.role")}
                      </span>
                      <span className="font-medium">admin, editor, viewer</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {te("data.status")}
                      </span>
                      <div className="flex gap-1">
                        <Badge variant="default">active</Badge>
                        <Badge variant="secondary">inactive</Badge>
                        <Badge variant="outline">pending</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={handleSimulateLoading}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    {showBeta ? "Beta Features Enabled" : "Simulate Loading"}
                  </CardTitle>
                </div>
                <CardDescription>
                  {isLoading
                    ? t("loading")
                    : "Click to simulate skeleton loading state"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <EmptyState
            icon={<Activity className="size-8" />}
            title={t("dashboard.recentActivity")}
            description={t("dashboard.noActivity")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
