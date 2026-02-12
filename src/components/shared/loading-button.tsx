"use client";

import { AnimatePresence, motion } from "framer-motion";
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
      <AnimatePresence mode="wait">
        {loading && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="mr-2"
          >
            <Loader2 className="size-4 animate-spin" />
          </motion.span>
        )}
        {success && !loading && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            className="mr-2"
          >
            <Check className="size-4 text-green-500" />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </Button>
  );
}
