"use client";

import { AnimateOnScroll, fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface LogoItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface LogoCloudProps {
  logos: LogoItem[];
  className?: string;
}

export function LogoCloud({ logos, className }: LogoCloudProps) {
  return (
    <AnimateOnScroll variants={fadeInUp} threshold={0.1} duration={0.5}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-10 gap-y-6",
          className,
        )}
      >
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="flex items-center gap-2 text-muted-foreground/50 transition-all duration-normal hover:text-foreground"
            title={logo.name}
          >
            <span className="[&>svg]:size-5">{logo.icon}</span>
            <span className="text-sm font-medium">{logo.name}</span>
          </div>
        ))}
      </div>
    </AnimateOnScroll>
  );
}
