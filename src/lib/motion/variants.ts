import type { Variants } from "framer-motion";

/* ===========================
   Variantes de entrada
   =========================== */

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
  exit: { opacity: 0, scale: 0.3 },
};

/* ===========================
   Containers com stagger
   =========================== */

export function staggerContainer(staggerDelay = 0.1): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };
}

/* ===========================
   Slide variants
   =========================== */

export function slideIn(
  direction: "left" | "right" | "up" | "down" = "up",
  distance = 30,
): Variants {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const value =
    direction === "left" || direction === "up" ? -distance : distance;

  return {
    initial: { opacity: 0, [axis]: value },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: value },
  };
}

/* ===========================
   Transicoes padrao
   =========================== */

export const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const fastTransition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};
