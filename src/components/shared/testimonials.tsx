"use client";

import { Quote } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import {
  AnimateOnScroll,
  fadeInUp,
  StaggerChildren,
  StaggerItem,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string;
  avatarFallback?: string;
}

interface TestimonialsProps {
  items: TestimonialItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function Testimonials({
  items,
  columns = 3,
  className,
}: TestimonialsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <StaggerChildren
      staggerDelay={0.1}
      className={cn("grid gap-6", gridCols[columns], className)}
    >
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <AnimateOnScroll variants={fadeInUp} threshold={0.1} duration={0.4}>
            <Card className="group h-full transition-all duration-normal hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <Quote className="size-6 text-primary/40 transition-colors duration-normal group-hover:text-primary/60" />
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 border-t pt-4">
                  <Avatar size="default">
                    {item.avatarUrl && (
                      <AvatarImage src={item.avatarUrl} alt={item.name} />
                    )}
                    <AvatarFallback>
                      {item.avatarFallback ??
                        item.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
