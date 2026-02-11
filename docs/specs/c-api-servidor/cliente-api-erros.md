# API Client & Errors

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Spec que define o cliente HTTP padrao do Core Stack, baseado em `fetch` nativo (sem axios), com suporte a interceptors, gestao de tokens de autenticacao, integracao React Query, retry com exponential backoff, normalizacao de erros multi-backend, boundaries de erro, e integracao com telemetria para logging de falhas.

## Motivacao

Projetos que consomem APIs precisam de um cliente HTTP consistente, tipado e resiliente. Evitar axios reduz bundle size e alinha ao ecossistema moderno (fetch). Unificar tratamento de erros de diferentes backends (REST, GraphQL, APIs legadas) permite UI consistente. O padrao de error boundaries e fallbacks melhora UX em cenarios de falha. Integracao com telemetria facilita debugging em producao. Aplicavel a dashboards, SaaS, e-commerce e qualquer app que consuma APIs externas.

## Requisitos Funcionais

- **RF01:** Wrapper leve sobre `fetch` com respostas tipadas (`ApiResponse<T>`) e suporte a GET, POST, PUT, PATCH, DELETE
- **RF02:** Sistema de interceptors (request e response) para injetar headers, transformar payloads e tratar respostas
- **RF03:** Gestao automatica de access token (Bearer) e refresh token com rotacao transparente em 401
- **RF04:** Integracao React Query (TanStack Query v5) para server state, cache por queryKey, e refetch configurvel
- **RF05:** Retry com exponential backoff (max retries configurvel, delay entre tentativas)
- **RF06:** Error boundaries globais e por secao com fallback UI customizavel
- **RF07:** Normalizacao de erros de diferentes backends para formato unificado `ApiError`
- **RF08:** Toast automatico para erros de API. Por padrao, erros 4xx e 5xx exibem toast. Pode ser desabilitado por request via opcao `{ silent: true }` no cliente HTTP. Erros de rede (offline) exibem toast especifico.
- **RF09:** Fallback UIs para estados de erro (empty, error, loading) com componentes padrao
- **RF10:** Integracao com modulo de telemetria para log de erros (mensagem, stack, contexto)

## Requisitos Nao-Funcionais

- **RNF01:** TypeScript strict - tipos seguros para request/response, sem `any`
- **RNF02:** Bundle size minimo - nao incluir axios; usar apenas fetch nativo
- **RNF03:** Performance - nao bloquear render em operacoes de rede
- **RNF04:** Acessibilidade - fallbacks e toasts acessiveis (ARIA, roles)

## Design da API / Interface

### Cliente HTTP e tipos base

```ts
// src/lib/api/types.ts
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
  original?: unknown;
}

export type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
export type ResponseInterceptor = <T>(response: Response, data: T) => T | Promise<T>;
```

### API Client com interceptors

```ts
// src/lib/api/client.ts
import type { ApiResponse, RequestInterceptor, ResponseInterceptor } from './types';

export function createApiClient(baseUrl: string) {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  const addRequestInterceptor = (fn: RequestInterceptor) => {
    requestInterceptors.push(fn);
    return () => requestInterceptors.splice(requestInterceptors.indexOf(fn), 1);
  };

  const addResponseInterceptor = (fn: ResponseInterceptor) => {
    responseInterceptors.push(fn);
    return () => responseInterceptors.splice(responseInterceptors.indexOf(fn), 1);
  };

  async function request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let config: RequestInit & { url: string } = { ...options, url: `${baseUrl}${url}` };
    for (const fn of requestInterceptors) config = fn(config);
    const { url: finalUrl, ...init } = config;
    const response = await fetch(finalUrl, init);
    let data = (await response.json().catch(() => ({}))) as T;
    for (const fn of responseInterceptors) data = await fn(response, data);
    return { data, status: response.status, headers: response.headers };
  }

  const get = <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'GET' });

  const post = <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });

  const put = <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });

  const patch = <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });

  const del = <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' });

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    addRequestInterceptor,
    addResponseInterceptor,
  };
}

// Instancia padrao usando variavel de ambiente
export const apiClient = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? '');
```

### Token injection e refresh

```tsx
// src/lib/api/auth-interceptor.ts
export function setupAuthInterceptors(
  client: ReturnType<typeof createApiClient>,
  getToken: () => string | null,
  refreshToken: () => Promise<string | null>
) {
  client.addRequestInterceptor((config) => {
    const token = getToken();
    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return config;
  });

  client.addResponseInterceptor(async (response, data) => {
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request with new token
        return data;
      }
    }
    return data;
  });
}
```

### React Query setup

```tsx
// src/providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Uso de useQuery com tratamento de erro

```tsx
// Exemplo de uso em componente
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ErrorFallback } from '@/components/shared/error-fallback';

function UserList() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<User[]>('/users'),
    retry: 3,
  });

  if (error) return <ErrorFallback error={error} onRetry={() => refetch()} />;
  if (isLoading) return <Skeleton />;
  return <ul>{data?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Error Boundary e normalizacao

```tsx
// src/components/shared/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import { logger } from '@/lib/telemetry/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export class ErrorBoundary extends Component<Props, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Unhandled render error', error, { componentStack: info.componentStack });
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ?? (
        <div role="alert">
          <h2>Algo deu errado</h2>
          <button onClick={() => this.setState({ hasError: false })}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Normalizacao de ApiError

```ts
// src/lib/api/errors.ts
export function normalizeApiError(err: unknown): ApiError {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const e = err as { message?: string; code?: string; status?: number; details?: unknown };
    return {
      code: e.code ?? 'UNKNOWN',
      message: e.message ?? 'Erro desconhecido',
      status: e.status,
      details: e.details,
      original: err,
    };
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : 'Erro desconhecido',
    original: err,
  };
}
```

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts          # createApiClient, apiClient (instancia padrao)
│   │   ├── types.ts           # ApiResponse, ApiError, interceptors
│   │   ├── auth-interceptor.ts
│   │   ├── errors.ts          # normalizeApiError
│   │   └── index.ts
│   └── telemetry/
│       └── logger.ts          # logger.error, logger.warn, logger.info
├── providers/
│   └── query-provider.tsx
├── components/
│   └── shared/
│       ├── error-boundary.tsx
│       ├── error-fallback.tsx  # UI de fallback
│       └── loading-fallback.tsx
└── app/
    └── layout.tsx             # QueryProvider + ErrorBoundary global
```

## Dependencias

### Bibliotecas Externas

- `@tanstack/react-query` (v5) - server state, cache, refetch
- `@tanstack/react-query-devtools` - dev tools para debug (opcional em prod)

### Specs Relacionados

- [Formularios](../b-dados-formularios/formularios.md) - envio de dados via API
- [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md) - tokens e refresh
- [Logging & Telemetria](../e-infraestrutura/logging-telemetria.md) - logger.error
- [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md) - toasts e estados vazios

## Notas de Implementacao

- **Error boundaries e fallback UIs** sao definidos e implementados na spec de [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md). Esta spec define como erros de API sao normalizados e propagados para esses boundaries.
- **Middleware de auth (refresh token)** e definido na spec de [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md). O interceptor de request desta spec apenas injeta o token; a logica de renovacao fica na spec de auth.

## Criterios de Aceite

- [ ] Cliente fetch tipado com `ApiResponse<T>` implementado
- [ ] Interceptors de request e response funcionais
- [ ] Ingestao de token Bearer via interceptor
- [ ] Refresh token em 401 configurado (ou stub para spec de auth)
- [ ] React Query provider configurado com staleTime e retryDelay
- [ ] Retry com exponential backoff em queries
- [ ] Error boundary global e por secao
- [ ] Normalizador `normalizeApiError` para formatos diversos
- [ ] Toast automatico para erros de API (via provider ou interceptor)
- [ ] Componentes ErrorFallback e LoadingFallback
- [ ] Integracao logger.error com modulo de telemetria
- [ ] Testes unitarios para client, errors e interceptors
- [ ] Documentacao de uso no README ou Storybook

## Referencias

- [Fetch API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TanStack Query - Overview](https://tanstack.com/query/latest/docs/react/overview)
- [Error Boundaries - React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
