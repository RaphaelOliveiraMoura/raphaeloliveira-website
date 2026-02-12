# Layouts & Responsividade

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-12

## Resumo

Padroes de layout para o Core Stack: Marketing (hero, features, CTA), Dashboard (sidebar + area de conteudo) e Auth (card centralizado). Inclui sidebar responsiva (colapsavel, drawer em mobile), navbar com menu hamburguer, hooks de breakpoint (`useMediaQuery`, `useBreakpoint`), deteccao mobile/tablet/desktop, container queries quando aplicavel e composicao via `layout.tsx` do Next.js.

## Motivacao

Projetos Next.js variam entre landing pages, dashboards e apps autenticadas. Cada tipo demanda layouts distintos. A ausencia de padroes reutilizaveis leva a codigo duplicado e comportamentos inconsistentes entre telas. Hooks de breakpoint centralizam logica de responsividade e facilitam componentes que reagem a viewport.

## Requisitos Funcionais

- **RF01:** Layout Marketing com secoes hero, features e CTA reutilizaveis
- **RF02:** Layout Dashboard com sidebar fixa/colapsavel e area de conteudo principal
- **RF03:** Sidebar responsiva: colapsavel em desktop, drawer (Sheet) em mobile. Icones Lucide por item de navegacao, tooltips laterais no estado colapsado, posicionamento `sticky top-0 h-screen`
- **RF04:** Layout Auth com card centralizado em tela cheia
- **RF05:** Navbar responsiva com menu hamburguer em mobile
- **RF06:** Hooks `useMediaQuery` e `useBreakpoint` para deteccao de viewport
- **RF07:** Suporte a container queries quando benefico (ex: cards em grid)
- **RF08:** Composicao via `layout.tsx` do App Router para aninhamento de layouts

## Requisitos Nao-Funcionais

- **RNF01:** Transicoes suaves na sidebar (collapse/expand) respeitando reduced-motion
- **RNF02:** Navbar fixa ou sticky conforme especificacao
- **RNF03:** Touch-friendly em mobile (areas de toque >= 44px)
- **RNF04:** Performance - evitar reflows desnecessarios em resize

## Design da API / Interface

### useMediaQuery e useBreakpoint

```tsx
// src/hooks/use-media-query.ts
"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

```tsx
// src/hooks/use-breakpoint.ts
"use client";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export function useBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  if (is2xl) return "2xl";
  if (isXl) return "xl";
  if (isLg) return "lg";
  if (isMd) return "md";
  if (isSm) return "sm";
  return "xs"; // viewport < 640px (mobile)
}

export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

export function useIsTablet(): boolean {
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  return md && !lg;
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
```

### Layout Dashboard com Sidebar Responsiva

```tsx
// src/app/(dashboard)/layout.tsx
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardNavbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
```

```tsx
// src/components/layouts/dashboard-sidebar.tsx
"use client";

import { useIsMobile } from "@/hooks/use-breakpoint";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Database,
  FileText,
  Settings,
  Blocks,
  ChevronsRight,
  PanelLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Cada item possui icone Lucide associado
const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/data", key: "data", icon: Database },
  { href: "/dashboard/forms", key: "forms", icon: FileText },
  { href: "/dashboard/settings", key: "settings", icon: Settings },
  { href: "/examples", key: "examples", icon: Blocks },
];

export function DashboardSidebar() {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Cada link renderiza: Icon + label (expandido) ou Icon + Tooltip (colapsado)
  // Active indicator com motion layoutId para animacao spring entre itens
  // ...

  // Desktop: wrapper com sticky top-0 h-screen para fixar ao scroll
  return (
    <div
      className={cn(
        "hidden shrink-0 lg:block sticky top-0 h-screen transition-all",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* aside com nav overflow-y-auto */}
    </div>
  );
}
```

**Comportamento da sidebar:**

- **Expandida:** icone + label de texto para cada item
- **Colapsada:** apenas icone centralizado, com `Tooltip` (side="right") exibindo o nome completo ao hover
- **Sticky:** wrapper desktop usa `sticky top-0 h-screen` para permanecer fixa durante scroll da pagina, igual ao comportamento do header (`DashboardNavbar`)
- **Scroll interno:** `<nav>` usa `overflow-y-auto` para scroll caso os itens excedam a viewport
- **Active indicator:** `motion.div` com `layoutId` para animacao spring entre itens ativos

### Layout Auth

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

### Layout Marketing (composicao)

```tsx
// src/app/(marketing)/layout.tsx
import { MarketingNavbar } from "@/components/layouts/marketing-navbar";
import { MarketingFooter } from "@/components/layouts/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
```

### Navbar com Menu Hamburguer

```tsx
// src/components/layouts/marketing-navbar.tsx
"use client";

import { useIsMobile } from "@/hooks/use-breakpoint";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

export function MarketingNavbar() {
  const isMobile = useIsMobile();

  const navLinks = (
    <>
      <Link href="/features">Features</Link>
      <Link href="/pricing">Pricing</Link>
      <Link href="/docs">Docs</Link>
    </>
  );

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/">Logo</Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-8">{navLinks}</nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/">Logo</Link>
        <nav className="flex gap-6">{navLinks}</nav>
      </div>
    </header>
  );
}
```

### Container Query (opcional)

```tsx
// src/components/shared/product-card.tsx
"use client";

import { useRef } from "react";

export function ProductCard() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="@container rounded-lg border p-4 @md:flex @md:gap-4"
    >
      <img className="@md:w-1/3" src="..." alt="..." />
      <div className="@md:flex-1">
        <h3>Product Name</h3>
        <p>Description...</p>
      </div>
    </div>
  );
}
```

## Estrutura de Arquivos

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── ...
│   └── (marketing)/
│       ├── layout.tsx
│       └── ...
├── components/
│   └── layouts/
│       ├── dashboard-sidebar.tsx
│       ├── dashboard-navbar.tsx
│       ├── marketing-navbar.tsx
│       ├── marketing-footer.tsx
│       └── auth-card.tsx
└── hooks/
    ├── use-media-query.ts
    └── use-breakpoint.ts
```

## Dependencias

### Bibliotecas Externas

- Componentes shadcn: Sheet (drawer mobile), Button
- Tailwind v4 - breakpoints padrao (sm, md, lg, xl, 2xl)
- `@container` - Tailwind container queries (v4 support)

### Specs Relacionados

- [Design System](./design-system.md) - espacamento, tokens
- [Componentes & Storybook](./componentes-storybook.md) - Sheet, Button
- [Acessibilidade](./acessibilidade.md) - focus em modal/drawer

## Notas de Implementacao

- Os hooks `useMediaQuery` e `useBreakpoint` sao definidos na spec [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md) como implementacao canonica. Esta spec documenta os **patterns de uso** desses hooks no contexto de layouts, mas a implementacao deve residir em `src/hooks/`.
- `AuthCard.tsx` mencionado na estrutura de arquivos e um componente de layout simples (card centralizado com logo e form slot) usado em paginas de login/registro.

## Criterios de Aceite

- [ ] Layout Marketing com navbar e footer responsivos
- [ ] Layout Dashboard com sidebar colapsavel em desktop
- [ ] Sidebar vira Sheet/drawer em mobile
- [ ] Layout Auth com card centralizado
- [ ] `useMediaQuery` e `useBreakpoint` implementados e documentados
- [ ] Navbar com menu hamburguer funcional em mobile
- [ ] `layout.tsx` aninhados corretamente (auth, dashboard, marketing)
- [ ] Container queries utilizadas onde fizer sentido
- [ ] Touch targets >= 44px em controles mobile

## Referencias

- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Container Queries - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [shadcn Sheet](https://ui.shadcn.com/docs/components/sheet)
