"use client";

import { forwardRef } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Permission } from "@/types/auth";

interface PermissionButtonProps
  extends React.ComponentProps<typeof Button> {
  permission: Permission;
  deniedTooltip?: string;
}

export const PermissionButton = forwardRef<
  HTMLButtonElement,
  PermissionButtonProps
>(function PermissionButton(
  {
    permission,
    deniedTooltip = "You don't have permission for this action",
    children,
    ...props
  },
  ref
) {
  const { can } = usePermissions();
  const hasPermission = can(permission);

  const button = (
    <Button ref={ref} disabled={!hasPermission} {...props}>
      {children}
    </Button>
  );

  if (!hasPermission && deniedTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{deniedTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});
