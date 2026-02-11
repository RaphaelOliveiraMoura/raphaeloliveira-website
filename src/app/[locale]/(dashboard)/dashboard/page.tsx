"use client";

import { Users, FileText, Activity, DollarSign } from "lucide-react";

import { useTranslations } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MOCK_STATS = [
  { key: "totalUsers" as const, value: "2,350", icon: Users, change: "+12.5%" },
  { key: "totalPosts" as const, value: "1,203", icon: FileText, change: "+8.2%" },
  { key: "activeNow" as const, value: "573", icon: Activity, change: "+3.1%" },
  { key: "revenue" as const, value: "$45,231", icon: DollarSign, change: "+20.1%" },
];

export default function DashboardPage() {
  const t = useTranslations("common");
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("dashboard.welcomeBack", { name: user?.name ?? "User" })}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_STATS.map((stat) => (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t(`dashboard.${stat.key}`)}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
          <CardDescription>{t("dashboard.noActivity")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
