"use client";

import Link from "next/link";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-breakpoint";

export function MarketingNavbar() {
  const isMobile = useIsMobile();

  const navLinks = (
    <>
      <Link
        href="/features"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Features
      </Link>
      <Link
        href="/pricing"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Pricing
      </Link>
      <Link
        href="/docs"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Docs
      </Link>
    </>
  );

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">
            Logo
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-8" aria-label="Navegação principal">
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Logo
        </Link>
        <nav className="flex gap-6" aria-label="Navegação principal">
          {navLinks}
        </nav>
      </div>
    </header>
  );
}
