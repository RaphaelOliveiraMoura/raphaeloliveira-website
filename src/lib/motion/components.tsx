"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, type Variants } from "framer-motion";

/* ===========================
   useInViewOnce - Observa quando o elemento entra no viewport
   Usa callback do IntersectionObserver (nao setState em effect body)
   =========================== */

function useInViewOnce(options?: { threshold?: number; once?: boolean }): {
  ref: React.RefObject<HTMLDivElement | null>;
  isInView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const threshold = options?.threshold ?? 0.2;
  const once = options?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, isInView };
}

import {
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeInUp,
  scaleIn,
  smoothTransition,
  staggerContainer,
} from "./variants";

/* ===========================
   FadeIn
   =========================== */

type FadeDirection = "up" | "down" | "left" | "right";

const directionVariants: Record<FadeDirection, Variants> = {
  up: fadeInUp,
  down: fadeInDown,
  left: fadeInLeft,
  right: fadeInRight,
};

interface FadeInProps {
  children: React.ReactNode;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof typeof motion;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.4,
  className,
}: FadeInProps) {
  return (
    <motion.div
      variants={directionVariants[direction]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ===========================
   SlideIn
   =========================== */

interface SlideInProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({
  children,
  direction = "left",
  distance = 30,
  delay = 0,
  duration = 0.3,
  className,
}: SlideInProps) {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const value =
    direction === "left" || direction === "up" ? -distance : distance;

  return (
    <motion.div
      initial={{ opacity: 0, [axis]: value }}
      animate={{ opacity: 1, [axis]: 0 }}
      exit={{ opacity: 0, [axis]: value }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ===========================
   StaggerChildren
   =========================== */

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={staggerContainer(staggerDelay)}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ===========================
   StaggerItem - filho de StaggerChildren
   =========================== */

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={smoothTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ===========================
   ScaleOnHover
   =========================== */

interface ScaleOnHoverProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.03,
  className,
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ===========================
   AnimateOnScroll
   =========================== */

interface AnimateOnScrollProps {
  children: React.ReactNode;
  variants?: Variants;
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function AnimateOnScroll({
  children,
  variants = scaleIn,
  threshold = 0.2,
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: AnimateOnScrollProps) {
  const { ref, isInView } = useInViewOnce({ threshold, once });

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ===========================
   CountUp
   =========================== */

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
}

export function CountUp({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
  separator = ",",
}: CountUpProps) {
  const { ref, isInView } = useInViewOnce({ threshold: 0.5 });

  return (
    <motion.span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {isInView ? (
        <CountUpAnimation
          end={end}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          separator={separator}
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </motion.span>
  );
}

function CountUpAnimation({
  end,
  duration,
  prefix,
  suffix,
  separator,
}: {
  end: number;
  duration: number;
  prefix: string;
  suffix: string;
  separator: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let startTime: number | null = null;
    let rafId: number;

    const formatNumber = (n: number) => {
      const rounded = Math.round(n);
      if (separator) {
        return rounded.toLocaleString("en-US");
      }
      return String(rounded);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;

      node.textContent = `${prefix}${formatNumber(current)}${suffix}`;

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, prefix, suffix, separator]);

  return <span ref={nodeRef}>{`${prefix}0${suffix}`}</span>;
}

/* ===========================
   TypeWriter
   =========================== */

interface TypeWriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
}

export function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  className,
  cursor = true,
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Ref para evitar re-entradas: setIsTyping causa re-render, e se isTyping
  // estivesse nos deps do useEffect, o cleanup cancelaria o setTimeout antes
  // de typeChar executar (o timer de 600ms era limpo pelo cleanup).
  const hasStartedRef = useRef(false);
  const { ref, isInView } = useInViewOnce({ threshold: 0 });

  useEffect(() => {
    if (!isInView || hasStartedRef.current) return;
    hasStartedRef.current = true;

    setIsTyping(true);
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;

    const typeChar = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        timer = setTimeout(typeChar, speed);
      } else {
        setIsTyping(false);
      }
    };

    timer = setTimeout(typeChar, delay);

    return () => clearTimeout(timer);
  }, [isInView, text, speed, delay]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {/* Zero-width space garante dimensoes reais para o IntersectionObserver
          quando displayedText esta vazio. Sem isso, o span tem area zero e
          o observer nunca dispara. */}
      {displayedText || "\u200B"}
      {cursor && isTyping && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

/* ===========================
   AnimatedTabs (indicator com layoutId)
   =========================== */

interface AnimatedTabIndicatorProps {
  layoutId?: string;
  className?: string;
}

export function AnimatedTabIndicator({
  layoutId = "tab-indicator",
  className,
}: AnimatedTabIndicatorProps) {
  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );
}

/* ===========================
   ScrollProgress
   =========================== */

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  return (
    <motion.div
      className={className}
      style={{
        scaleX: 0,
        transformOrigin: "0%",
      }}
      // scaleX controlado via useScroll no componente pai, ou via CSS
    />
  );
}

/* ===========================
   AnimatePresence re-export
   =========================== */

export { AnimatePresence };
