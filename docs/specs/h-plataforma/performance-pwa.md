# Performance & PWA

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Estratégias de performance para Next.js 16 e suporte a Progressive Web App (PWA). Cobre code splitting via `next/dynamic`, otimização de imagens com `next/image`, virtualização de listas (TanStack Virtual), bundle analysis, monitoramento de Web Vitals (LCP, CLS, INP, FID, TTFB), otimização de fontes e scripts de terceiros, service worker para offline, Web App Manifest, página de fallback offline, prompt de instalação e estratégias de cache (cache-first, network-first, stale-while-revalidate).

## Motivacao

Performance impacta diretamente Core Web Vitals, SEO e retenção de usuários. Projetos derivados do Core Stack precisam de padrões claros para carregamento rápido e boa experiência em redes lentas. PWA permite que aplicações web funcionem offline e sejam instaláveis, aumentando engajamento em mobile. Um template base com essas práticas reduz trabalho repetitivo e garante baseline de qualidade.

## Requisitos Funcionais

- **RF01:** Code splitting via `next/dynamic` com lazy loading e fallback de loading
- **RF02:** Padrões de otimização de imagem com `next/image` (sizes, placeholder, priority)
- **RF03:** Virtualização de listas grandes com TanStack Virtual
- **RF04:** Setup de bundle analysis (next-bundle-analyzer ou @next/bundle-analyzer)
- **RF05:** Monitoramento e otimização de Web Vitals (LCP, CLS, INP, FID, TTFB)
- **RF06:** Otimização de fontes (preload, font-display: swap)
- **RF07:** Otimização de scripts de terceiros via `next/script`
- **RF08:** Service worker para suporte offline
- **RF09:** Web App Manifest (manifest.json) configurado
- **RF10:** Página de fallback offline para usuários sem conexão
- **RF11:** Prompt de instalação PWA (beforeinstallprompt)
- **RF12:** Estratégias de cache documentadas (cache-first, network-first, stale-while-revalidate)

## Requisitos Nao-Funcionais

- **RNF01:** LCP < 2.5s medido no Lighthouse (modo mobile, throttling padrao)
- **RNF02:** CLS < 0.1 para evitar layout shift
- **RNF03:** INP < 200ms para interatividade
- **RNF04:** Bundle analysis executável via comando npm (não em produção)
- **RNF05:** Service worker testado com Playwright: navegacao entre rotas dinamicas funciona corretamente em modo offline-first

## Design da API / Interface

### Code Splitting (next/dynamic)

```tsx
// src/components/shared/LazyChart.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const Chart = dynamic(() => import('@/components/shared/Chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
});

interface LazyChartProps {
  data: unknown[];
}

export function LazyChart({ data }: LazyChartProps) {
  return <Chart data={data} />;
}

// Usage:
// <LazyChart data={salesData} />

// Com named export
const HeavyModal = dynamic(
  () => import('@/components/modals/HeavyModal').then((m) => m.HeavyModal),
  { loading: () => <Skeleton /> }
);
```

### Otimização de Imagens

```tsx
// next.config.ts - domains permitidos
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/**' },
    ],
  },
};

// Uso em componente
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

<Image
  src={user.avatar}
  alt={user.name}
  width={48}
  height={48}
  sizes="(max-width: 768px) 48px, 64px"
  className="rounded-full"
/>
```

### Virtualização com TanStack Virtual

```tsx
// src/components/shared/VirtualList.tsx
'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  estimateSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function VirtualList<T>({
  items,
  estimateSize = 50,
  renderItem,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Bundle Analysis

```ts
// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  // ... other config
}

// Bundle analyzer (apenas em analise)
const withBundleAnalyzer = process.env.ANALYZE === "true"
  ? (await import("@next/bundle-analyzer")).default({ enabled: true })
  : (config: NextConfig) => config

export default withBundleAnalyzer(nextConfig)

// package.json
// "analyze": "ANALYZE=true next build"
```

### Web Vitals e reportWebVitals

`reportWebVitals` e uma funcao utilitaria, nao um componente. Para uso em React, criar um componente client-side que chama a funcao:

```tsx
// src/lib/telemetry/web-vitals.ts
import { onCLS, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

type ReportCallback = (metric: { name: string; value: number }) => void;

export function reportWebVitals(onPerfEntry?: ReportCallback) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onINP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

// src/components/shared/WebVitalsReporter.tsx
"use client"

import { useEffect } from "react"
import { reportWebVitals } from "@/lib/telemetry/web-vitals"

export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals((metric) => {
      // Enviar para analytics
      logger.info("Web Vital", { name: metric.name, value: metric.value })
    })
  }, [])

  return null
}

// src/app/layout.tsx - adicionar ao root layout
import { WebVitalsReporter } from '@/components/shared/WebVitalsReporter';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <WebVitalsReporter />
      </body>
    </html>
  );
}
```

### Otimização de Fontes

```tsx
// src/app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/custom.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

// globals.css
// font-display: swap via configuração do next/font
```

### Scripts de Terceiros (next/script)

```tsx
import Script from 'next/script';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://analytics.example.com/script.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://widget.example.com/embed.js"
        strategy="lazyOnload"
      />
      {children}
    </>
  );
}
```

### Web App Manifest

```json
// public/manifest.json
{
  "name": "Core Stack App",
  "short_name": "CoreStack",
  "description": "Aplicação base Core Stack",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#18181b",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### PWA Install Prompt

```tsx
// src/hooks/usePWAInstall.ts
'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    return outcome === 'accepted';
  };

  return { isInstallable, install };
}
```

### Estratégias de Cache (Service Worker)

```
Cache-First: Para assets estáticos (JS, CSS, imagens)
  → Retorna do cache; se não existir, busca na rede e armazena

Network-First: Para dados críticos (API)
  → Tenta rede; em falha, usa cache como fallback

Stale-While-Revalidate: Para dados que podem ser um pouco desatualizados
  → Retorna cache imediatamente, atualiza em background
```

## Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx
│   ├── offline/
│   │   └── page.tsx          # Página fallback offline (padrao App Router)
│   └── manifest.ts           # Geração dinâmica do manifest (opcional)
├── lib/
│   └── telemetry/
│       └── web-vitals.ts
├── hooks/
│   └── usePWAInstall.ts
├── components/
│   └── shared/
│       ├── VirtualList.tsx
│       ├── WebVitalsReporter.tsx
│       └── InstallPWAButton.tsx
public/
├── manifest.json
└── sw.js                     # Service worker (ou via next-pwa)
next.config.ts
```

> Usar `app/offline/page.tsx` para a pagina de fallback offline (padrao App Router). O arquivo `public/offline.html` e alternativa apenas se nao usar App Router.

## Dependencias

### Bibliotecas Externas

- `@tanstack/react-virtual` — virtualização de listas
- `@next/bundle-analyzer` — análise de bundle
- `web-vitals` — métricas Core Web Vitals
- Utilizar `@ducanh2912/next-pwa` (fork mantido do next-pwa) ou configuracao manual com Workbox. Para projetos que nao precisam de PWA, esta secao e opcional.

### Specs Relacionados

- [Logging & Telemetria](../e-infraestrutura/logging-telemetria.md) — envio de Web Vitals
- [Design System](../a-fundacao-visual/design-system.md) — skeletons de loading
- [Exibicao & Gestao de Dados](../b-dados-formularios/exibicao-gestao-dados.md) — VirtualList em tabelas

## Criterios de Aceite

- [ ] Exemplos de `next/dynamic` com loading state para componentes pesados
- [ ] Configuração de `next/image` com remotePatterns e placeholders
- [ ] VirtualList genérica com TanStack Virtual funcional
- [ ] Comando `npm run analyze` gera report de bundle
- [ ] Web Vitals reportados via `WebVitalsReporter` (integração com analytics opcional)
- [ ] manifest.json válido e linkado no layout
- [ ] Service worker registrado e funcionando em build de produção
- [ ] Página /offline acessível quando offline
- [ ] Hook usePWAInstall funcional com beforeinstallprompt
- [ ] LCP < 2.5s medido no Lighthouse (modo mobile, throttling padrao)
- [ ] Service worker testado com Playwright: navegacao entre rotas dinamicas funciona corretamente em modo offline-first
- [ ] Documentação de estratégias de cache em README ou doc

## Notas de Implementacao

- **Web Vitals** sao coletados pela spec de [Logging & Telemetria](../e-infraestrutura/logging-telemetria.md). Esta spec define como **otimizar** essas metricas (lazy loading, image optimization, code splitting).
- **Virtualizacao de listas** integra com a spec de [Exibicao & Gestao de Dados](../b-dados-formularios/exibicao-gestao-dados.md) para DataTables com muitas linhas.
- O componente `WebVitalsReporter` deve ser adicionado ao root layout (`src/app/layout.tsx`).

## Referencias

- [Next.js Dynamic Import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [Web Vitals](https://web.dev/vitals/)
- [@ducanh2912/next-pwa](https://github.com/nicepkg/next-pwa)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
