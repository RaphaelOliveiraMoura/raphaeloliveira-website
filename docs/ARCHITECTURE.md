# Arquitetura

Documento descrevendo as decisoes arquiteturais, padroes e convencoes do Core Stack.

> **Escopo:** Este documento cobre o "por que" das escolhas arquiteturais. Regras operacionais para agentes de IA estao em `.cursor/rules/`. Guia de contribuicao para humanos esta em [CONTRIBUTING.md](CONTRIBUTING.md).

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

**Escolha:** Server Components por padrao. `"use client"` apenas quando necessario (hooks, event handlers, browser APIs).

**Motivo:**

- Reduz JavaScript enviado ao cliente
- Permite fetch e acesso a recursos do servidor diretamente no componente
- Melhor performance (menos hydration)

> Regras praticas de quando usar cada um e padroes de implementacao: `.cursor/rules/components.mdc`.

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

| Camada           | Ferramenta                           | Exemplos                      |
| ---------------- | ------------------------------------ | ----------------------------- |
| **Server State** | React Query (TanStack Query)         | Dados da API, cache, refetch  |
| **Client State** | React Context + useState             | Tema, sidebar aberta, modal   |
| **URL State**    | useSearchParams + hooks customizados | Filtros, paginacao, ordenacao |

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

> Regras praticas de testes: `.cursor/rules/testing.mdc`. Scripts disponiveis: [CONTRIBUTING.md](CONTRIBUTING.md).

| Nivel       | Ferramenta            | Escopo                      |
| ----------- | --------------------- | --------------------------- |
| Unit        | Vitest                | Funcoes, hooks, utilitarios |
| Component   | Testing Library       | Componentes React isolados  |
| Integration | Testing Library + MSW | Fluxos com API mockada      |
| E2E         | Playwright            | Fluxos completos no browser |

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

> Fonte canonica: `.cursor/rules/general.mdc` (secao "Convencoes de Nomenclatura").
> Consulte-a para a tabela completa de padroes (kebab-case para arquivos, PascalCase para componentes, etc.).

## Modulos e Dependencias

As funcionalidades sao organizadas em camadas. Cada camada pode depender das abaixo dela:

1. **Fundacao Visual** — Design System, Componentes & Storybook, Layouts & Responsividade, Acessibilidade
2. **Features** — Formularios (validacao, mascaras), Exibicao de Dados (DataTable, listas, CRUD), Navegacao (URL state, busca)
3. **API & Server** — Cliente HTTP, Server Actions, Real-time
4. **Infraestrutura** — Auth, Telemetria & Logging, i18n & SEO

Cada modulo pode ser adotado independentemente. As specs documentam as dependencias entre modulos.
