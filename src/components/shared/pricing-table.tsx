"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ScaleOnHover } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  period?: string;
  features: PricingFeature[];
  ctaLabel: string;
  onCtaClick?: () => void;
  badge?: string;
}

interface PricingTableProps {
  tiers: PricingTier[];
  highlightedTier?: string;
  className?: string;
}

export function PricingTable({
  tiers,
  highlightedTier,
  className,
}: PricingTableProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        tiers.length === 2 && "md:grid-cols-2",
        tiers.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {tiers.map((tier) => {
        const isHighlighted = tier.id === highlightedTier;
        return (
          <ScaleOnHover key={tier.id} scale={1.02}>
            <Card
              className={cn(
                "relative flex h-full flex-col transition-shadow duration-normal",
                isHighlighted ? "border-primary shadow-lg" : "hover:shadow-md",
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1 text-xs">
                    {tier.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      /{tier.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        !feature.included && "text-muted-foreground/50",
                      )}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          feature.included
                            ? "text-primary"
                            : "text-muted-foreground/30",
                        )}
                      />
                      <span className={cn(!feature.included && "line-through")}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isHighlighted ? "default" : "outline"}
                  onClick={tier.onCtaClick}
                >
                  {tier.ctaLabel}
                </Button>
              </CardFooter>
            </Card>
          </ScaleOnHover>
        );
      })}
    </div>
  );
}
