"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useClipboard } from "@/hooks";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { copy, copied } = useClipboard();
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-muted/50 font-mono text-sm",
        className,
      )}
    >
      {language && (
        <span className="absolute right-12 top-2 text-xs text-muted-foreground">
          {language}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute right-2 top-2"
        onClick={() => copy(code)}
        aria-label={copied ? t("codeBlock.copied") : t("codeBlock.copy")}
      >
        {copied ? (
          <Check className="size-3 text-green-500" aria-hidden />
        ) : (
          <Copy className="size-3" aria-hidden />
        )}
      </Button>
      <pre className="overflow-x-auto p-4 pr-12">
        <code>{code}</code>
      </pre>
    </div>
  );
}
