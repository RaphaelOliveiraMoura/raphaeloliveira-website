# Arquitetura

Documento descrevendo as decisoes arquiteturais, padroes e convencoes do Core Stack.

> **Escopo:** Este documento cobre o "por que" das escolhas arquiteturais. Regras operacionais para agentes de IA estao em `.cursor/rules/`. Guia de contribuicao para humanos esta em [CONTRIBUTING.md](CONTRIBUTING.md). Documentacao detalhada da API: [`backend/README.md`](../backend/README.md).

## Visao Geral

Core Stack e um template **full-stack** composto por dois projetos independentes:

- **Frontend:** Next.js App Router com React Server Components
- **Backend:** Fastify API REST com Drizzle ORM e PostgreSQL

```
[Browser] → [Next.js App Router (porta 3000)]
                  │
        ┌─────────┼─────────┐
        │         │         │
   [Server       [Server   [Client
   Components]   Actions]  Components]
        │         │         │
        └─────────┼─────────┘
                  │
      [Fastify API REST (porta 3001)]
                  │
         [Drizzle ORM + PostgreSQL]
```

O frontend e o backend sao independentes: cada um tem seu proprio `package.json`, scripts, testes e pipeline de build. O frontend consome a API via `apiClient` configurado em `@/lib/api/client`.

## Decisoes Arquiteturais — Frontend

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

## Decisoes Arquiteturais — Backend

> Documentacao detalhada de endpoints, logging e como adicionar modulos: [`backend/README.md`](../backend/README.md).

### 8. Fastify (vs Express/Hono)

**Escolha:** Fastify v5 como framework HTTP do backend.

**Motivo:**

- Performance superior ao Express (schema-based serialization, compilacao JIT de JSON)
- Sistema de plugins robusto com encapsulamento de contexto
- Suporte nativo a JSON Schema / Swagger via decorators
- Ecossistema maduro (`@fastify/jwt`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/cookie`)
- TypeScript first-class com type providers

### 9. Drizzle ORM (vs Prisma/TypeORM)

**Escolha:** Drizzle ORM com driver `postgres.js`.

**Motivo:**

- Queries type-safe que mapeiam 1:1 com SQL (sem abstractions magicas)
- Zero overhead em runtime (nao gera query engine como o Prisma)
- Migrations SQL puras (transparentes, auditaveis)
- Drizzle Studio para exploracao visual do banco
- Excelente inferencia de tipos TypeScript (schema = types)

### 10. Arquitetura Modular por Feature

**Escolha:** Modulos organizados por dominio (`auth/`, `users/`, `health/`) com camadas internas.

**Motivo:**

- Cada modulo e auto-contido (routes, service, repository, schemas, types)
- Facilita adicionar novos modulos sem afetar existentes
- Separacao clara de responsabilidades entre camadas

**Fluxo de uma request:**

```
Request → Route → [Hooks/Guards] → Service → Repository → Drizzle/DB
```

| Camada         | Responsabilidade                                              |
| -------------- | ------------------------------------------------------------- |
| **Routes**     | Definir endpoints, validar input (Zod), serializar output     |
| **Services**   | Logica de negocio, sem acesso direto ao banco                 |
| **Repository** | Encapsular queries Drizzle, retornar entidades de dominio     |
| **Plugins**    | Concerns transversais (auth, CORS, rate limiting, docs, logs) |
| **Hooks**      | Pre-handlers reutilizaveis (authenticate, authorize)          |

### 11. JWT com Access + Refresh Tokens

**Escolha:** Access token curto (15min) + Refresh token longo (7d) em cookie httpOnly.

**Motivo:**

- Access token curto limita a janela de exposicao em caso de vazamento
- Refresh token em cookie httpOnly impede acesso via JavaScript (protecao XSS)
- Rotacao de refresh token a cada uso (token antigo e revogado)
- Compativel com o fluxo de auth do frontend (`apiClient` + interceptor de refresh)

### 12. Wide Events / Canonical Log Lines

**Escolha:** Pino com padrao de uma unica linha de log por request.

**Motivo:**

- Um unico log line por request com todo o contexto (userId, action, resource, duration, status)
- Facilita busca e correlacao em ferramentas de observabilidade (Datadog, Grafana, etc.)
- Campos enriquecidos ao longo do ciclo da request via `request.ctx`
- JSON estruturado em producao, formato legivel em desenvolvimento (`pino-pretty`)
- Nao polui logs com multiplas linhas por request

### 13. Validacao de Env com Zod

**Escolha:** Validar todas as variaveis de ambiente na inicializacao com Zod.

**Motivo:**

- Fail fast: servidor nao inicia se faltar variavel obrigatoria ou tipo estiver errado
- Schema Zod serve como documentacao viva das env vars
- Inferencia TypeScript automatica (`env.DATABASE_URL` e tipado como string URL)
- Valores default para desenvolvimento, sem default em producao para variaveis criticas

### 14. Testes com Banco Real (vs mocks)

**Escolha:** Testes de integracao usando PostgreSQL real (container dedicado na porta 5433).

**Motivo:**

- Testes refletem comportamento real do banco (constraints, tipos, etc.)
- Drizzle `db:push` recria o schema no banco de teste antes da suite
- Container isolado para testes (`postgres-test` no docker-compose)
- CI usa service container do GitHub Actions com a mesma imagem
- Sem mocks de banco que podem divergir do comportamento real

## Fluxo de Dados

### Frontend → Backend (mutacoes)

```
[Evento do Usuario]
        │
        ▼
[Client Component] ──→ [apiClient (fetch wrapper)]
        │                       │
        ▼                       ▼
[React Query Cache] ←── [Fastify API (porta 3001)]
        │                       │
        ▼                       ▼
[UI Atualizada]          [Drizzle → PostgreSQL]
```

### Frontend (leitura com SSR)

```
[Server Component]
        │
        ▼
[fetch() com cache] ──→ [Fastify API / Database]
        │
        ▼
[Render HTML no servidor]
        │
        ▼
[Streaming para o browser]
```

### Backend (fluxo interno)

```
[HTTP Request]
        │
        ▼
[Fastify Plugins] ──→ [CORS, Rate Limit, Auth JWT]
        │
        ▼
[Route Handler] ──→ [Zod validation]
        │
        ▼
[Service] ──→ [Business logic]
        │
        ▼
[Repository] ──→ [Drizzle query]
        │
        ▼
[PostgreSQL]
        │
        ▼
[Response + Canonical Log Line]
```

## Convencoes de Nomenclatura

> Fonte canonica: `.cursor/rules/general.mdc` (secao "Convencoes de Nomenclatura").
> Consulte-a para a tabela completa de padroes (kebab-case para arquivos, PascalCase para componentes, etc.).

## Modulos e Dependencias

### Frontend

As funcionalidades sao organizadas em camadas. Cada camada pode depender das abaixo dela:

1. **Fundacao Visual** — Design System, Componentes & Storybook, Layouts & Responsividade, Acessibilidade
2. **Features** — Formularios (validacao, mascaras), Exibicao de Dados (DataTable, listas, CRUD), Navegacao (URL state, busca)
3. **API & Server** — Cliente HTTP, Server Actions, Real-time
4. **Infraestrutura** — Auth, Telemetria & Logging, i18n & SEO

Cada modulo pode ser adotado independentemente. As specs documentam as dependencias entre modulos.

### Backend

Os modulos do backend sao organizados por dominio em `backend/src/modules/`:

| Modulo     | Endpoints                                                 | Descricao                                |
| ---------- | --------------------------------------------------------- | ---------------------------------------- |
| **auth**   | `POST /auth/login`, `/refresh`, `/logout`, `GET /auth/me` | Autenticacao JWT com refresh tokens      |
| **users**  | `GET /users`, `GET /users/:id`, `POST`, `PATCH`, `DELETE` | CRUD de usuarios com RBAC (admin)        |
| **health** | `GET /health`                                             | Health check (conectividade com o banco) |

Cada modulo segue a mesma estrutura interna: `routes.ts` → `service.ts` → `repository.ts` + `schemas.ts` + `types.ts`. Guia para adicionar novos modulos: [`backend/README.md`](../backend/README.md#adding-a-new-module).

### Integracao Frontend ↔ Backend

O frontend se conecta ao backend via `apiClient` (`@/lib/api/client`) configurado com:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- **Autenticacao:** O `apiClient` intercepta respostas 401 e automaticamente faz refresh do token
- **Tipos compartilhados:** Os schemas Zod do backend servem como referencia para os tipos do frontend
- **CORS:** O backend aceita requests de `CORS_ORIGIN` (default: `http://localhost:3000`)
