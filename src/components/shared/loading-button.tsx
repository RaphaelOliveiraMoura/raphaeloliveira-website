import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  success?: boolean;
}

export function LoadingButton({
  loading,
  success,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {success && <Check className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}
