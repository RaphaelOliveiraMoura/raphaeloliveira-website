"use client";

import { ErrorState } from "@/components/shared/error-state";

interface ErrorFallbackProps {
  error: Error | unknown;
  onRetry?: () => void;
}

/**
 * Wrapper de compatibilidade. Prefira usar `ErrorState` diretamente.
 */
export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return <ErrorState error={error} onRetry={onRetry} />;
}
