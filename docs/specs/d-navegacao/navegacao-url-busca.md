# Navegacao, URL & Busca

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Spec que define padrões de navegação e estado na URL: hook `useUrlState` para sincronização bidirecional (URL ↔ state), filtros persistidos (texto, data, select, multi-select), paginação e ordenação via query params, breadcrumbs automáticos, command palette (Cmd+K), barra de busca global com autocomplete, debounce, histórico e highlighting, route guards via middleware, e padrões de navegação programática.

## Motivacao

Filtros em URL permitem compartilhar e bookmarks de views. Paginação e ordenação na URL mantêm estado ao voltar/avançar. Breadcrumbs melhoram orientação em dashboards. Command palette acelera navegação para power users. Busca global é essencial em SaaS e e-commerce. Route guards protegem rotas sensíveis. Padrões claros garantem consistência em qualquer projeto Next.js.

## Requisitos Funcionais

- **RF01:** Hook `useUrlState` para leitura e escrita de search params com sincronização bidirecional
- **RF02:** Filtros persistidos em URL: texto, date range, select, multi-select
- **RF03:** Paginação via URL (`page`, `pageSize`)
- **RF04:** Ordenação via URL (`sortBy`, `sortOrder`)
- **RF05:** Breadcrumbs gerados automaticamente a partir das rotas
- **RF06:** Command palette (Cmd+K / Ctrl+K) para navegação rápida
- **RF07:** Barra de busca global com autocomplete, debounce e histórico de buscas recentes. Autocomplete combina buscas recentes (localStorage) com resultados da API (server-side). Buscas recentes aparecem antes dos resultados da API.
- **RF08:** Highlighting do termo de busca nos resultados e estado "nenhum resultado"
- **RF09:** Route guards / middleware para rotas protegidas
- **RF10:** Padrões de navegação programática (`router.push`, `router.replace`)

## Requisitos Nao-Funcionais

- **RNF01:** URL state deve ser serializável e persistir ao refresh
- **RNF02:** Debounce na busca global (min 300ms)
- **RNF03:** Acessibilidade - command palette e busca com teclado

## Design da API / Interface

### useUrlState

```ts
// src/hooks/use-url-state.ts
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlState<T extends string>(
  key: string,
  defaultValue?: T
): [T, (value: T | undefined) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = (searchParams.get(key) as T) ?? defaultValue ?? ('' as T);

  const setValue = useCallback(
    (newValue: T | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === undefined || newValue === '') {
        params.delete(key);
      } else {
        params.set(key, String(newValue));
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [key, router, pathname, searchParams]
  );

  return [value, setValue];
}
```

### useUrlState para multi-select

```ts
// src/hooks/use-url-state-multi.ts
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useUrlStateMulti(key: string, separator = ','): [string[], (values: string[]) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get(key);
  const value = useMemo(
    () => (raw ? raw.split(separator).filter(Boolean) : []),
    [raw, separator]
  );

  const setValue = useCallback(
    (newValues: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValues.length === 0) params.delete(key);
      else params.set(key, newValues.join(separator));
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [key, router, pathname, searchParams, separator]
  );

  return [value, setValue];
}
```

### Paginação e ordenação

```tsx
// src/hooks/use-url-pagination.ts
'use client';

import { useUrlState } from './use-url-state';

export function useUrlPagination(defaultPageSize = 20) {
  const [page, setPage] = useUrlState('page', '1');
  const [pageSize, setPageSize] = useUrlState('pageSize', String(defaultPageSize));
  const [sortBy, setSortBy] = useUrlState('sortBy');
  const [sortOrder, setSortOrder] = useUrlState<'asc' | 'desc'>('sortOrder', 'asc');

  return {
    page: Number(page) || 1,
    pageSize: Number(pageSize) || defaultPageSize,
    sortBy: sortBy || undefined,
    sortOrder,
    setPage: (p: number) => setPage(String(p)),
    setPageSize: (s: number) => setPageSize(String(s)),
    setSort: (by: string, order: 'asc' | 'desc') => { setSortBy(by); setSortOrder(order); },
  };
}
```

### Breadcrumbs automáticos

```tsx
// src/components/navigation/breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  dashboard: 'Painel',
  users: 'Usuários',
  products: 'Produtos',
  settings: 'Configurações',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = LABELS[segment] ?? segment;
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex gap-2 text-sm">
        <li><Link href="/">Home</Link></li>
        {crumbs.map((c, i) => (
          <li key={c.href}>
            <span aria-hidden>/</span>
            {i === crumbs.length - 1 ? (
              <span aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href}>{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### Command Palette (Cmd+K)

```tsx
// src/components/navigation/command-palette.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  label: string;
  href: string;
  keywords?: string[];
}

const COMMANDS: Command[] = [
  { id: 'dashboard', label: 'Ir para Dashboard', href: '/dashboard', keywords: ['painel'] },
  { id: 'users', label: 'Usuários', href: '/users', keywords: ['people'] },
  { id: 'settings', label: 'Configurações', href: '/settings', keywords: ['config'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.keywords?.some((k) => k.includes(query.toLowerCase()))
  );

  const onSelect = useCallback(
    (cmd: Command) => {
      router.push(cmd.href);
      setOpen(false);
      setQuery('');
    },
    [router]
  );

  if (!open) return null;
  return (
    <div role="dialog" aria-label="Command palette">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        autoFocus
      />
      <ul>
        {filtered.map((cmd) => (
          <li key={cmd.id}>
            <button type="button" onClick={() => onSelect(cmd)}>{cmd.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Tipos de busca e hook useSearchResults

```tsx
// src/lib/search/types.ts
interface SearchResult {
  id: string
  type: "page" | "user" | "product" | "document"
  title: string
  description?: string
  url: string
  icon?: React.ReactNode
}
```

```tsx
// src/lib/search/use-search-results.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function useSearchResults(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiClient.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  })
}
```

### Hook useRecentSearches

```tsx
// src/hooks/use-recent-searches.ts
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';

function useRecentSearches(maxItems = 5) {
  const [searches, setSearches] = useLocalStorage<string[]>("recent-searches", [])

  const addSearch = (query: string) => {
    setSearches((prev) => [query, ...prev.filter((s) => s !== query)].slice(0, maxItems))
  }

  const clearSearches = () => setSearches([])

  return { searches, addSearch, clearSearches }
}
```

### Barra de busca global

```tsx
// src/components/search/global-search.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useSearchResults } from '@/lib/search/use-search-results';
import { SearchResultItem } from '@/components/search/search-result-item';
import type { SearchResult } from '@/lib/search/types';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { searches, addSearch } = useRecentSearches();
  const { data: results, isLoading } = useSearchResults(debouncedQuery);

  const onSelect = useCallback(
    (result: SearchResult) => {
      addSearch(debouncedQuery);
      // navegar para result.url
    },
    [debouncedQuery, addSearch]
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
      />
      {!debouncedQuery && searches.length > 0 && (
        <ul>
          <li className="text-muted-foreground">Buscas recentes</li>
          {searches.map((s) => (
            <li key={s}><button onClick={() => setQuery(s)}>{s}</button></li>
          ))}
        </ul>
      )}
      {debouncedQuery && (
        results?.length === 0
          ? <p>Nenhum resultado para &quot;{query}&quot;</p>
          : (
            <ul>
              {results?.map((r) => (
                <li key={r.id} onClick={() => onSelect(r)}>
                  <SearchResultItem result={r} query={debouncedQuery} />
                </li>
              ))}
            </ul>
          )
      )}
    </div>
  );
}
```

### Highlighting do termo

```tsx
// src/components/search/highlight-match.tsx
export function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  // split com captura: indices impares sao os matches
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : part
      )}
    </>
  );
}
```

### Componente SearchResultItem

```tsx
// src/components/search/search-result-item.tsx
import { HighlightMatch } from './highlight-match';

function SearchResultItem({ result, query }: { result: SearchResult; query: string }) {
  return (
    <a href={result.url} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
      {result.icon && <span className="text-muted-foreground">{result.icon}</span>}
      <div>
        <HighlightMatch text={result.title} query={query} />
        {result.description && (
          <p className="text-sm text-muted-foreground">{result.description}</p>
        )}
      </div>
    </a>
  )
}
```

### Route guards (middleware)

```ts
// src/middleware.ts (extensão do padrão de auth)
const protectedPaths = ['/dashboard', '/admin', '/settings'];
const publicPaths = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const login = new URL('/login', request.url);
    login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}
```

### Navegação programática

```tsx
// Padrões documentados
import { useRouter, usePathname } from 'next/navigation';

const router = useRouter();
const pathname = usePathname();

// Navegar e manter no histórico
router.push('/dashboard');

// Navegar substituindo (sem adicionar ao histórico)
router.replace('/login');

// Voltar
router.back();

// Com query params (usar pathname para construir URL completa)
router.push(`${pathname}?page=2&sortBy=name`);
```

## Estrutura de Arquivos

```
src/
├── hooks/
│   ├── use-url-state.ts
│   ├── use-url-state-multi.ts
│   ├── use-url-pagination.ts
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── use-recent-searches.ts
├── components/
│   ├── navigation/
│   │   ├── breadcrumbs.tsx
│   │   └── command-palette.tsx
│   └── search/
│       ├── global-search.tsx
│       ├── highlight-match.tsx
│       └── search-result-item.tsx
├── lib/
│   └── search/
│       ├── types.ts
│       └── use-search-results.ts
└── middleware.ts
```

## Dependencias

### Bibliotecas Externas

- `@tanstack/react-query` (v5) - useSearchResults para busca global
- Opcional: `cmdk` - para command palette mais robusta

### Specs Relacionados

- [API Client & Errors](../c-api-servidor/cliente-api-erros.md) - busca global chama API
- [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md) - route guards
- [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md) - useDebounce, useLocalStorage

## Notas de Implementacao

- **Route guards e middleware de protecao** sao definidos na spec de [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md). Esta spec documenta patterns de navegacao generica; a logica de protecao de rotas por auth fica na spec de auth.
- **Command palette** pode integrar com o sistema de [Keyboard Shortcuts](../f-padroes-ux/interacoes-avancadas.md) para Cmd+K. A implementacao do comando fica nesta spec; o registro do shortcut usa o hook da spec de interacoes.
- O hook `useLocalStorage` utilizado por `useRecentSearches` vem da spec de [Hooks & Utilitarios](../h-plataforma/hooks-utilitarios.md).

## Criterios de Aceite

- [ ] Hook useUrlState com sync bidirecional
- [ ] Hooks useUrlStateMulti, useUrlPagination
- [ ] Filtros (texto, data, select, multi-select) persistidos em URL
- [ ] Breadcrumbs gerados a partir das rotas
- [ ] Command palette abrindo com Cmd+K / Ctrl+K
- [ ] Barra de busca global com autocomplete
- [ ] Debounce mínimo 300ms na busca
- [ ] Histórico de buscas recentes
- [ ] Highlighting do termo nos resultados
- [ ] Estado "nenhum resultado"
- [ ] Route guards no middleware
- [ ] Padrões de navegação programática documentados
- [ ] Testes para hooks de URL
- [ ] Acessibilidade (teclado) em command palette e busca

## Referencias

- [useSearchParams - Next.js](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [useRouter - Next.js](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Middleware - Next.js](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [cmdk - Command Menu](https://cmdk.paco.me/)
