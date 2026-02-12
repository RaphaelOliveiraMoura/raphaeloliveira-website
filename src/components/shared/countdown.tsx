"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CountdownLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface CountdownProps {
  targetDate: Date;
  labels?: CountdownLabels;
  className?: string;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const diff = Math.max(targetDate.getTime() - Date.now(), 0);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const DEFAULT_LABELS: CountdownLabels = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

function AnimatedDigit({ value }: { value: number }) {
  const formatted = String(value).padStart(2, "0");

  return (
    <div className="relative flex h-16 w-14 items-center justify-center overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-border sm:h-20 sm:w-18">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={formatted}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl"
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function Countdown({
  targetDate,
  labels = DEFAULT_LABELS,
  className,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const segments: { value: number; label: string }[] = [
    { value: timeLeft.days, label: labels.days },
    { value: timeLeft.hours, label: labels.hours },
    { value: timeLeft.minutes, label: labels.minutes },
    { value: timeLeft.seconds, label: labels.seconds },
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 sm:gap-4",
        className,
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {segments.map((segment, idx) => (
        <div key={segment.label} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-2">
            <AnimatedDigit value={segment.value} />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {segment.label}
            </span>
          </div>
          {idx < segments.length - 1 && (
            <span className="mb-6 text-2xl font-bold text-muted-foreground/50">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
