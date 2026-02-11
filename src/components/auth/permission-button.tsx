"use client";

import { forwardRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTranslations } from "@/lib/i18n";
import { usePermissions } from "@/hooks/use-permissions";

import type { Permission } from "@/types/auth";

interface PermissionButtonProps extends React.ComponentProps<typeof Button> {
  permission: Permission;
  deniedTooltip?: string;
}

export const PermissionButton = forwardRef<
  HTMLButtonElement,
  PermissionButtonProps
>(function PermissionButton(
  { permission, deniedTooltip, children, ...props },
  ref,
) {
  const { can } = usePermissions();
  const t = useTranslations("common");
  const hasPermission = can(permission);
  const tooltipText = deniedTooltip ?? t("permission.denied");

  const button = (
    <Button ref={ref} disabled={!hasPermission} {...props}>
      {children}
    </Button>
  );

  if (!hasPermission && tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});
