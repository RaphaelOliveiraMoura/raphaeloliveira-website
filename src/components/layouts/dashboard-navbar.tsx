"use client";

import Link from "next/link";

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      <Link href="/dashboard" className="text-lg font-semibold">
        Logo
      </Link>
      <nav className="flex items-center gap-4" aria-label="Navegação secundária">
        <span className="text-sm text-muted-foreground">Nav area</span>
      </nav>
    </header>
  );
}
