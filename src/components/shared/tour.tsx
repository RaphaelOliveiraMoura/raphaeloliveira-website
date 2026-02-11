"use client";

import { useEffect, useRef } from "react";

import { type Config, driver, type DriveStep } from "driver.js";

import { isClient } from "@/lib/utils/environment";

import "driver.js/dist/driver.css";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface TourConfig {
  id: string;
  steps: TourStep[];
  onComplete?: () => void;
}

interface TourProps {
  config: TourConfig;
  autoStart?: boolean;
  showOnce?: boolean;
}

function getStorageKey(tourId: string): string {
  return `core-stack:tour:${tourId}:completed`;
}

function isTourCompleted(tourId: string): boolean {
  if (!isClient()) return true;
  return localStorage.getItem(getStorageKey(tourId)) === "true";
}

function markTourCompleted(tourId: string) {
  if (!isClient()) return;
  localStorage.setItem(getStorageKey(tourId), "true");
}

function mapSteps(steps: TourStep[]): DriveStep[] {
  return steps.map((step) => ({
    element: step.target,
    popover: {
      title: step.title,
      description: step.content,
      side: step.placement,
    },
  }));
}

export function Tour({ config, autoStart = true, showOnce = true }: TourProps) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (!autoStart) return;
    if (showOnce && isTourCompleted(config.id)) return;

    startedRef.current = true;

    const driverConfig: Config = {
      showProgress: true,
      steps: mapSteps(config.steps),
      onDestroyStarted: () => {
        if (showOnce) markTourCompleted(config.id);
        config.onComplete?.();
        driverInstance.destroy();
      },
    };

    const driverInstance = driver(driverConfig);

    // Slight delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      driverInstance.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
      driverInstance.destroy();
    };
  }, [config, autoStart, showOnce]);

  return null;
}

export function resetTour(tourId: string) {
  if (!isClient()) return;
  localStorage.removeItem(getStorageKey(tourId));
}

export type { TourConfig, TourStep };
