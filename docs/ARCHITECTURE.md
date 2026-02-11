# Arquitetura

Documento descrevendo as decisoes arquiteturais, padroes e convencoes do Core Stack.

## Visao Geral

Core Stack e construido sobre o **Next.js App Router**, utilizando React Server Components como padrao e Client Components apenas quando necessario (interatividade, hooks de estado, eventos de browser).

```
[Browser] → [Next.js App Router]
                  │
        ┌─────────┼─────────┐
        │         │         │
   [Server       [Server   [Client
   Components]   Actions]  Components]
        │         │         │
        └─────────┼─────────┘
                  │
           [API / Database]
```

## Decisoes Arquiteturais

### 1. App Router (vs Pages Router)

**Escolha:** Next.js App Router com React Server Components.

**Motivo:**
- Server Components reduzem JavaScript enviado ao cliente
- Layouts aninhados e loading states nativos
- Server Actions para mutacoes sem API routes explicitas
- Streaming e Suspense integrados
- Futuro do Next.js - Pages Router esta em modo de manutencao

### 2. Server Components vs Client Components

**Regra geral:** Tudo e Server Component por padrao. Usar `"use client"` apenas quando necessario.

**Usar Server Component quando:**
- Buscar dados (fetch, database queries)
- Acessar recursos do servidor (env vars, filesystem)
- Renderizar conteudo estatico ou semi-estatico

**Usar Client Component quando:**
- Precisa de `useState`, `useEffect`, `useContext`
- Precisa de event handlers (onClick, onChange, etc.)
- Precisa de APIs do browser (localStorage, geolocation, etc.)
- Usa bibliotecas que dependem de state/effects

### 3. Estilizacao: Tailwind CSS v4 + shadcn/ui

**Escolha:** Tailwind CSS v4 via PostCSS + componentes shadcn/ui.

**Motivo:**
- Tailwind v4 usa CSS nativo (custom properties, cascade layers)
- shadcn/ui fornece componentes acessiveis e customizaveis (nao e uma dependencia, e codigo copiado)
- CSS variables permitem tema dinamico (dark/light mode) sem JavaScript
- Sem runtime CSS-in-JS = melhor performance

**Hierarquia de estilizacao:**
```
CSS Variables (tokens)
    └── Tailwind CSS v4 (utility classes)
        └── shadcn/ui (component classes)
            └── Custom components (composicao)
```

### 4. Gerenciamento de Estado

O estado e dividido em tres camadas:

| Camada | Ferramenta | Exemplos |
|--------|-----------|----------|
| **Server State** | React Query (TanStack Query) | Dados da API, cache, refetch |
| **Client State** | React Context + useState | Tema, sidebar aberta, modal |
| **URL State** | useSearchParams + hooks customizados | Filtros, paginacao, ordenacao |

**Regra:** Preferir URL State para qualquer estado que faz sentido compartilhar via link (filtros, pagina atual, busca). Isso melhora UX (bookmarkable, back button funciona) e SEO.

### 5. Formularios: react-hook-form + Zod

**Escolha:** react-hook-form para estado + Zod para validacao.

**Motivo:**
- react-hook-form tem performance superior (uncontrolled inputs)
- Zod fornece validacao em runtime + inferencia de tipos TypeScript
- Schemas Zod podem ser reutilizados entre client e server (Server Actions)
- Integracao nativa via `@hookform/resolvers`

### 6. API Client: Fetch + React Query

**Escolha:** Wrapper sobre `fetch` nativo + React Query para cache/estado.

**Motivo:**
- `fetch` e nativo e integrado com Next.js (cache, revalidation)
- React Query gerencia cache, loading states, retry, optimistic updates
- Nao adicionar axios (fetch nativo e suficiente com um wrapper leve)

### 7. Testes: Vitest + Testing Library + Playwright

| Nivel | Ferramenta | Escopo |
|-------|-----------|--------|
| Unit | Vitest | Funcoes, hooks, utilitarios |
| Component | Testing Library | Componentes React isolados |
| Integration | Testing Library + MSW | Fluxos com API mockada |
| E2E | Playwright | Fluxos completos no browser |

## Fluxo de Dados

```
[Evento do Usuario]
        │
        ▼
[Client Component] ──→ [Server Action / API Call]
        │                       │
        ▼                       ▼
[React Query Cache] ←── [API Response]
        │
        ▼
[UI Atualizada]
```

Para leitura de dados:
```
[Server Component]
        │
        ▼
[fetch() com cache] ──→ [API / Database]
        │
        ▼
[Render HTML no servidor]
        │
        ▼
[Streaming para o browser]
```

## Convencoes de Nomenclatura

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `UserCard.tsx` |
| Hooks | camelCase com `use` | `useDebounce.ts` |
| Utilitarios | camelCase | `formatCurrency.ts` |
| Tipos | PascalCase | `UserProfile` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Pastas | kebab-case | `feature-flags/` |
| Rotas (app/) | kebab-case | `app/user-settings/` |
| Arquivos de spec | kebab-case | `api-client-errors.md` |

## Modulos e Dependencias

As funcionalidades do Core Stack sao organizadas em modulos independentes com dependencias explicitas:

```
                    ┌─────────────┐
                    │ Design      │
                    │ System      │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼──┐  ┌─────▼────┐  ┌───▼───────┐
      │Components│  │ Layouts  │  │Accessibility│
      │& Storybook│  │& Responsive│ │           │
      └───────┬──┘  └─────┬────┘  └───┬───────┘
              │            │            │
              └────────────┼────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
   ┌─────▼─────┐   ┌──────▼─────┐   ┌───────▼──────┐
   │  Forms    │   │Data Display│   │  Navigation  │
   │(validation│   │(DataTable, │   │(URL state,   │
   │ masks)    │   │ lists, CRUD)│  │ search)      │
   └─────┬─────┘   └──────┬─────┘   └───────┬──────┘
         │                 │                  │
         └─────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API &     │
                    │   Server    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼───┐ ┌─────▼────┐ ┌────▼─────┐
       │   Auth   │ │Telemetry │ │   i18n   │
       │          │ │& Logging │ │   & SEO  │
       └──────────┘ └──────────┘ └──────────┘
```

Cada modulo pode ser adotado independentemente. As specs documentam as dependencias entre modulos.
