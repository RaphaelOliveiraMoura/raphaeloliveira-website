"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MailCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Link, useTranslations } from "@/lib/i18n";
import { logger } from "@/lib/telemetry/logger";

type VerifyStatus = "verifying" | "success" | "error" | "no-token";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>(
    token ? "verifying" : "no-token",
  );
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true;

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error("Verification failed");
        setStatus("success");
      } catch (err) {
        logger.error("Email verification error", err);
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  const config: Record<
    VerifyStatus,
    {
      icon: React.ReactNode;
      iconBg: string;
      title: string;
      message: string;
    }
  > = {
    verifying: {
      icon: <Loader2 className="h-6 w-6 animate-spin text-primary" />,
      iconBg: "bg-primary/10",
      title: t("verifyEmailTitle"),
      message: t("verifyingEmail"),
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
      iconBg: "bg-primary/10",
      title: t("verifyEmailTitle"),
      message: t("verifyEmailSuccess"),
    },
    error: {
      icon: <XCircle className="h-6 w-6 text-destructive" />,
      iconBg: "bg-destructive/10",
      title: t("verifyEmailTitle"),
      message: t("verifyEmailError"),
    },
    "no-token": {
      icon: <MailCheck className="h-6 w-6 text-destructive" />,
      iconBg: "bg-destructive/10",
      title: t("invalidToken"),
      message: t("verifyEmailError"),
    },
  };

  const current = config[status];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div
          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${current.iconBg}`}
        >
          {current.icon}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {current.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">{current.message}</p>
      </CardContent>
      {status !== "verifying" && (
        <CardFooter className="flex justify-center border-t px-6 py-4">
          {status === "success" ? (
            <Link href="/login">
              <Button>{t("goToLogin")}</Button>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("backToLogin")}
            </Link>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
