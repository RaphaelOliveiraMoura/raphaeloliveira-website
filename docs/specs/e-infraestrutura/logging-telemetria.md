# Logging & Telemetria

> **Status:** `concluido`
> **Prioridade:** `media`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de logging e telemetria para o Core Stack. Cobre logger client-side com niveis (debug, info, warn, error), formato estruturado, integracao com error tracking (Sentry), sistema de analytics com eventos tipados, monitoramento de Web Vitals (LCP, CLS, INP, TTFB), rastreamento de acoes do usuario (cliques, page views, submissions), monitoramento de performance, sampling de logs em producao e consideracoes de privacidade (filtro de PII).

## Motivacao

Aplicacoes precisam de visibilidade para debugar problemas, entender uso e melhorar performance. Logs desestruturados dificultam analise; ausencia de error tracking impede correcao proativa; analytics nao tipados geram bugs silenciosos. O Core Stack deve fornecer uma base observavel e preparada para escala.

## Requisitos Funcionais

- **RF01:** Logger client-side com niveis: debug, info, warn, error
- **RF02:** Formato de log estruturado (JSON ou objeto com timestamp, level, message, context)
- **RF03:** Integracao com error tracking (Sentry ou similar) - captura de erros nao tratados
- **RF04:** Sistema de analytics com eventos tipados (page_view, click, form_submit, etc.)
- **RF05:** Web Vitals: LCP, CLS, INP, TTFB (reportWebVitals + optional forwarding)
- **RF06:** Rastreamento de acoes: cliques em CTAs, page views, form submissions
- **RF07:** Monitoramento de performance (tempo de resposta, metricas custom)
- **RF08:** Sampling em producao: taxa padrao de 10% para analytics events e 100% para erros. Configuravel via variavel de ambiente `NEXT_PUBLIC_TELEMETRY_SAMPLE_RATE`.
- **RF09:** Consideracoes de privacidade: filtro de PII nos logs e analytics

## Requisitos Nao-Funcionais

- **RNF01:** TypeScript - eventos de analytics tipados
- **RNF02:** Logger com impacto minimo em bundle e runtime
- **RNF03:** Configuravel por ambiente (dev verbose, prod sampling)

## Design da API / Interface

### Logger com Niveis

```ts
// src/lib/telemetry/logger.ts
import * as Sentry from "@sentry/nextjs"

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'; // resolved at build time by Next.js
const IS_BROWSER = typeof window !== 'undefined';
const minLevel: LogLevel = IS_DEVELOPMENT ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function formatEntry(entry: LogEntry): string | object {
  if (IS_DEVELOPMENT) return `[${entry.level}] ${entry.message}${entry.context ? ` ${JSON.stringify(entry.context)}` : ''}`;
  return { ...entry, context: entry.context };
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (shouldLog('debug')) {
      const entry: LogEntry = { level: 'debug', message, timestamp: new Date().toISOString(), context };
      console.debug(formatEntry(entry));
    }
  },
  info(message: string, context?: Record<string, unknown>) {
    if (shouldLog('info')) {
      const entry: LogEntry = { level: 'info', message, timestamp: new Date().toISOString(), context };
      console.info(formatEntry(entry));
    }
  },
  warn(message: string, context?: Record<string, unknown>) {
    if (shouldLog('warn')) {
      const entry: LogEntry = { level: 'warn', message, timestamp: new Date().toISOString(), context };
      console.warn(formatEntry(entry));
    }
  },
  error(message: string, error?: Error, context?: Record<string, unknown>) {
    if (shouldLog('error')) {
      const entry: LogEntry = {
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        context: { ...context, error: error?.message, stack: error?.stack },
      };
      console.error(formatEntry(entry));
      // Forward to Sentry
      if (error) {
        Sentry.captureException(error, { extra: context });
      }
    }
  },
};
```

### Integracao Sentry

```ts
// src/lib/telemetry/sentry.ts
import * as Sentry from "@sentry/nextjs"

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'; // resolved at build time by Next.js

export function initErrorTracking() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: IS_DEVELOPMENT ? 1.0 : 0.1,
  })
}

// Em error handlers:
// Sentry.captureException(error, { extra: context })
```

### Sampling em Producao

```ts
// src/lib/telemetry/sampling.ts
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'; // resolved at build time by Next.js

export function shouldSample(sampleRate: number): boolean {
  if (IS_DEVELOPMENT) return true;
  return Math.random() < sampleRate;
}

// Uso: logger.debug so em 10% das sessoes em prod
const DEBUG_SAMPLE_RATE = 0.1;
if (shouldSample(DEBUG_SAMPLE_RATE)) logger.debug('verbose info', { userId });
```

### Eventos de Analytics Tipados

```ts
// src/lib/telemetry/analytics.ts
import { logger } from './logger';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export type AnalyticsEvent =
  | { name: 'page_view'; properties: { path: string; referrer?: string } }
  | { name: 'click'; properties: { element: string; href?: string; label?: string; [key: string]: unknown } }
  | { name: 'form_submit'; properties: { formId: string; success: boolean } }
  | { name: 'search'; properties: { query: string; resultsCount: number } }
  | { name: 'error'; properties: { message: string; stack?: string; context?: string } };

const PII_KEYS = ['email', 'phone', 'cpf', 'password', 'token'];

function filterPii(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !PII_KEYS.some((pii) => key.toLowerCase().includes(pii)))
  );
}

export function track(event: AnalyticsEvent) {
  const payload = {
    ...event,
    properties: event.properties ? filterPii(event.properties as Record<string, unknown>) : undefined,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.name, payload.properties);
  }
  logger.debug('analytics', { event: event.name, ...payload });
}
```

### Web Vitals

```tsx
// src/lib/telemetry/web-vitals.ts
import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals';
import { logger } from './logger';

// onFID foi deprecado em favor de onINP (Interaction to Next Paint)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function sendToAnalytics(metric: { name: string; value: number; id: string }) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
    });
  }
  logger.info('web-vital', { metric: metric.name, value: metric.value });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

```tsx
// src/components/telemetry/WebVitalsReporter.tsx - client component
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/telemetry/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => reportWebVitals(), []);
  return null;
}
```

```tsx
// src/app/layout.tsx
import { WebVitalsReporter } from '@/components/telemetry/WebVitalsReporter';

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

### Hook useTrackEvent

```tsx
// src/hooks/useTrackEvent.ts
'use client';

import { useCallback } from 'react';
import { track, type AnalyticsEvent } from '@/lib/telemetry/analytics';

export function useTrackEvent() {
  return useCallback((event: AnalyticsEvent) => {
    track(event);
  }, []);
}

// Uso
function ProductCard({ id, name }: { id: string; name: string }) {
  const trackEvent = useTrackEvent();
  return (
    <button onClick={() => trackEvent({ name: 'click', properties: { element: 'product_card', productId: id } })}>
      {name}
    </button>
  );
}
```

### Page View Tracking

```tsx
// src/components/telemetry/PageViewTracker.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/telemetry/analytics';

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track({ name: 'page_view', properties: { path: pathname, referrer: document.referrer } });
  }, [pathname]);

  return null;
}
```

## Estrutura de Arquivos

```
src/
├── lib/
│   └── telemetry/
│       ├── logger.ts           # logger com niveis
│       ├── sampling.ts         # shouldSample
│       ├── analytics.ts        # track, eventos tipados, filterPii
│       ├── web-vitals.ts       # reportWebVitals
│       ├── sentry.ts           # initErrorTracking
│       └── index.ts
├── hooks/
│   └── useTrackEvent.ts
├── components/
│   └── telemetry/
│       ├── PageViewTracker.tsx
│       └── WebVitalsReporter.tsx
└── app/
    └── layout.tsx              # PageViewTracker, WebVitalsReporter
```

## Dependencias

### Bibliotecas Externas

- `web-vitals` - metricas LCP, CLS, INP, TTFB
- `@sentry/nextjs` (opcional) - error tracking

### Specs Relacionados

- [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) - error boundaries, retry
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) - env para Sentry DSN, filtro PII

## Notas de Implementacao

- **Web Vitals** sao coletados nesta spec e reportados via o sistema de analytics. A spec de [Performance & PWA](../h-plataforma/performance-pwa.md) define como otimizar esses metricas, mas a medicao e responsabilidade desta spec.
- **Error tracking** integra com os error boundaries definidos na spec de [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md).
- A funcao `logger.error()` e a interface padrao para log de erros. A spec de [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) deve usar `logger.error()` (nao `logError()`).

## Criterios de Aceite

- [ ] Logger com niveis debug, info, warn, error implementado
- [ ] Formato estruturado em producao, legivel em dev
- [ ] Integracao Sentry (ou similar) para captura de erros
- [ ] Eventos de analytics tipados (page_view, click, form_submit como minimo)
- [ ] Web Vitals sendo reportados
- [ ] PageViewTracker em uso no layout
- [ ] Hook useTrackEvent disponivel
- [ ] Sampling documentado ou implementado para logs em prod
- [ ] Filtro de PII em propriedades de analytics
- [ ] Configuravel por env (Sentry DSN, sample rates)
- [ ] Documentacao de como adicionar novos eventos

## Referencias

- [Web Vitals](https://web.dev/vitals/)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Google Analytics - gtag](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [Structured Logging - Best Practices](https://www.honeycomb.io/blog/structured-logging-and-your-team)
- [GDPR - Logging Best Practices](https://gdpr.eu/checklist/)
