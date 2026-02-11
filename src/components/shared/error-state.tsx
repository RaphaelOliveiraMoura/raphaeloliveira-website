import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo deu errado",
  message,
  error,
  onRetry,
}: ErrorStateProps) {
  const displayMessage =
    message ??
    (error instanceof Error
      ? error.message
      : "Não foi possível carregar. Tente novamente.");

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border p-12 text-center"
    >
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{displayMessage}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
