"use client";

import {
  Activity,
  CheckCircle,
  FileText,
  Info,
  MessageSquare,
  Users,
  XCircle,
} from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import {
  EmptyState,
  ErrorState,
  Feature,
  SkeletonCard,
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

import { useFeedbackStats, useHealth, useUsers } from "@/lib/api/hooks";
import {
  useDateFormatter,
  useNumberFormatter,
  useTranslations,
} from "@/lib/i18n";
import { useFeatureFlag, useIsMobile } from "@/hooks";

import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const t = useTranslations("common");
  const { user } = useAuth();
  const { number: formatNumber } = useNumberFormatter();
  const { relative } = useDateFormatter();
  const isMobile = useIsMobile();
  const showBeta = useFeatureFlag("betaFeatures");

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useUsers({ page: 1, limit: 1 });

  const { data: feedbackStats, isLoading: feedbackLoading } =
    useFeedbackStats();

  const { data: healthData, isLoading: healthLoading } = useHealth();

  const isLoading = usersLoading || healthLoading;
  const hasFatalError = !!usersError;

  const totalUsers = usersData?.meta?.total ?? 0;
  const totalFeedback = feedbackStats?.total ?? 0;
  const openFeedback = feedbackStats?.byStatus?.open ?? 0;
  const resolvedFeedback = feedbackStats?.byStatus?.resolved ?? 0;

  const stats = [
    {
      key: "totalUsers",
      label: t("dashboard.totalUsers"),
      value: formatNumber(totalUsers),
      icon: Users,
      progress: Math.min((totalUsers / 100) * 100, 100),
    },
    {
      key: "totalFeedback",
      label: "Total Feedback",
      value: formatNumber(totalFeedback),
      icon: MessageSquare,
      progress: Math.min((totalFeedback / 50) * 100, 100),
    },
    {
      key: "openIssues",
      label: "Open Issues",
      value: formatNumber(openFeedback),
      icon: FileText,
      progress:
        totalFeedback > 0
          ? Math.round((openFeedback / totalFeedback) * 100)
          : 0,
    },
    {
      key: "resolved",
      label: "Resolved",
      value: formatNumber(resolvedFeedback),
      icon: CheckCircle,
      progress:
        totalFeedback > 0
          ? Math.round((resolvedFeedback / totalFeedback) * 100)
          : 0,
    },
  ];

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
          {healthData && (
            <Badge
              variant={healthData.status === "ok" ? "default" : "destructive"}
              className="hidden sm:inline-flex"
            >
              {healthData.status === "ok" ? "API Online" : "API Degraded"}
            </Badge>
          )}
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
          {hasFatalError ? (
            <ErrorState
              title="Erro ao carregar dados"
              message="Nao foi possivel carregar as estatisticas do dashboard."
              error={usersError ?? undefined}
              onRetry={() => {
                void refetchUsers();
              }}
            />
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.key}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.label}
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icon className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>{stat.label}</TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <Progress value={stat.progress} className="h-1.5" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Health & System Info */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">System Health</CardTitle>
                  <Badge variant="outline">
                    {isMobile ? "Mobile" : "Desktop"}
                  </Badge>
                </div>
                <CardDescription>Backend API status</CardDescription>
              </CardHeader>
              <CardContent>
                {healthData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <div className="flex items-center gap-1.5">
                        {healthData.status === "ok" ? (
                          <CheckCircle className="size-3.5 text-green-600" />
                        ) : (
                          <XCircle className="size-3.5 text-red-600" />
                        )}
                        <span className="font-medium capitalize">
                          {healthData.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Database</span>
                      <span className="font-medium capitalize">
                        {healthData.database}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">
                        {Math.floor(healthData.uptime / 3600)}h{" "}
                        {Math.floor((healthData.uptime % 3600) / 60)}m
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("loading")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    {showBeta ? "Beta Features Enabled" : "Feedback Summary"}
                  </CardTitle>
                </div>
                <CardDescription>
                  {feedbackStats && !feedbackLoading
                    ? `${totalFeedback} total, ${openFeedback} open`
                    : t("loading")}
                </CardDescription>
              </CardHeader>
              {feedbackStats && (
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(feedbackStats.byStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize text-muted-foreground">
                            {status.replace("_", " ")}
                          </span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              )}
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
