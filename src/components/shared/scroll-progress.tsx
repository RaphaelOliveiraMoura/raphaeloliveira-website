"use client";

import { motion, useScroll, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={cn(
        "fixed top-0 right-0 left-0 z-100 h-0.5 origin-left bg-primary",
        className,
      )}
      style={{ scaleX }}
    />
  );
}
