"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface AnimatedRecommendationsProps {
  recommendations: RecommendationItem[];
  autoplay?: boolean;
  autoplayInterval?: number;
  className?: string;
}

export function AnimatedRecommendations({
  recommendations,
  autoplay = false,
  autoplayInterval = 5000,
  className,
}: AnimatedRecommendationsProps) {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % recommendations.length);
  };

  const handlePrev = () => {
    setActive(
      (prev) => (prev - 1 + recommendations.length) % recommendations.length,
    );
  };

  const isActive = (index: number) => index === active;

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(handleNext, autoplayInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, autoplayInterval, active]);

  return (
    <div
      className={cn(
        "mx-auto max-w-sm px-4 py-20 md:max-w-4xl md:px-8 lg:px-12",
        className,
      )}
    >
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        {/* Image Stack */}
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {recommendations.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : recommendations.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={recommendations[active]?.image as string}
                    alt={recommendations[active]?.name as string}
                    fill
                    draggable={false}
                    className="rounded-3xl object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="text-2xl font-bold text-foreground">
              {recommendations[active]?.name}
            </h3>
            <motion.p className="mt-8 text-lg text-muted-foreground">
              {recommendations[active]?.description
                .split(" ")
                .map((word, idx) => (
                  <motion.span
                    key={`${active}-${idx}`}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * idx,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
            </motion.p>
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              aria-label="Recomendação anterior"
              className="group/button flex size-7 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
            >
              <ChevronLeft className="size-5 text-foreground transition-transform duration-300 group-hover/button:rotate-12" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Próxima recomendação"
              className="group/button flex size-7 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80"
            >
              <ChevronRight className="size-5 text-foreground transition-transform duration-300 group-hover/button:-rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
