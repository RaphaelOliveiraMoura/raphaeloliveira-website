"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useTranslations } from "@/lib/i18n";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  error,
  onRetry,
}: ErrorStateProps) {
  const t = useTranslations("errors");

  const displayTitle = title ?? t("generic");
  const displayMessage =
    message ?? (error instanceof Error ? error.message : t("loadFailed"));

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-lg border p-12 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: 0.1,
        }}
      >
        <AlertCircle className="mb-4 size-12 animate-wiggle text-destructive" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="text-lg font-semibold"
      >
        {displayTitle}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-2 text-sm text-muted-foreground"
      >
        {displayMessage}
      </motion.p>
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            {t("retry")}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
