"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useScrollPosition } from "@/hooks/use-scroll-position";

interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export function BackToTop({ threshold = 400, className }: BackToTopProps) {
  const { y } = useScrollPosition();
  const isVisible = y > threshold;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className={className}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="size-10 rounded-full shadow-lg"
            aria-label="Back to top"
          >
            <ArrowUp className="size-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
