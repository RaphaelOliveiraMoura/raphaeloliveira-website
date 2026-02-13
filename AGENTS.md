# AGENTS.md

> Contexto para agentes de IA que trabalham neste projeto.

## Identidade

Core Stack e um template full-stack:

- **Frontend:** Next.js 16 (App Router) com React 19, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui e React Compiler.
- **Backend:** Fastify v5 com Drizzle ORM, PostgreSQL 17, JWT auth, Zod validation e Pino logger.

Convencoes:

- **Idioma:** codigo em ingles, documentacao em portugues (BR).

## Arquitetura

Frontend e backend sao projetos independentes (cada um com seu `package.json`, scripts, testes e pipeline).

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

### Gerenciamento de Estado

| Camada           | Ferramenta                           | Exemplos                      |
| ---------------- | ------------------------------------ | ----------------------------- |
| **Server State** | React Query (TanStack Query)         | Dados da API, cache, refetch  |
| **Client State** | React Context + useState             | Tema, sidebar aberta, modal   |
| **URL State**    | useSearchParams + hooks customizados | Filtros, paginacao, ordenacao |

Preferir URL State para qualquer estado compartilhavel via link (filtros, pagina, busca).

### Fluxo de Dados — Frontend (mutacoes)

```
[Client Component] → [apiClient (fetch wrapper)] → [Fastify API (porta 3001)]
        │                                                    │
        ▼                                                    ▼
[React Query Cache] ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ [Drizzle → PostgreSQL]
```

### Fluxo de Dados — Frontend (SSR)

```
[Server Component] → [fetch() com cache] → [Fastify API] → [Render HTML] → [Streaming]
```

### Arquitetura do Backend

Modulos organizados por dominio (`auth/`, `users/`, `health/`) com camadas internas:

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

### JWT Auth

Access token curto (15min) + refresh token longo (7d) em cookie httpOnly. Rotacao de refresh token a cada uso. O `apiClient` intercepta 401 e faz refresh automaticamente.

### Integracao Frontend ↔ Backend

O frontend consome a API via `apiClient` (`@/lib/api/client`) configurado com `NEXT_PUBLIC_API_URL`. CORS configurado via `CORS_ORIGIN` no backend.

## Navegacao por Contexto

### Convencoes e Regras (`.cursor/rules/`)

| Contexto de trabalho                                                      | Fonte canonica                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Convencoes gerais (naming, imports, TS, exports, logging, estrutura)      | [general.mdc](.cursor/rules/general.mdc)               |
| Internacionalizacao (imports centralizados, textos, navegacao, rich text) | [i18n.mdc](.cursor/rules/i18n.mdc)                     |
| Componentes React (estrutura, RSC vs client, a11y, styling)               | [components.mdc](.cursor/rules/components.mdc)         |
| Hooks (catalogo, quando usar, como criar)                                 | [hooks.mdc](.cursor/rules/hooks.mdc)                   |
| Error handling (ErrorState, boundaries, normalizeApiError)                | [error-handling.mdc](.cursor/rules/error-handling.mdc) |
| Lint e React Compiler (regras, footguns, pre-commit)                      | [linting.mdc](.cursor/rules/linting.mdc)               |
| Testes (Vitest, Testing Library, Playwright, MSW)                         | [testing.mdc](.cursor/rules/testing.mdc)               |
| AI Skills (instalacao, criacao, manutencao)                               | [skills.mdc](.cursor/rules/skills.mdc)                 |

### Documentacao

| Assunto                                                     | Fonte                                          |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Guia de contribuicao — commits, scripts, CI, git hooks      | [CONTRIBUTING.md](CONTRIBUTING.md)             |
| Catalogo de features — 25 features com API surface e paths  | [docs/FEATURES.md](docs/FEATURES.md)           |
| Autenticacao — fluxo ponta a ponta, JWT, refresh, guards    | [docs/AUTH.md](docs/AUTH.md)                   |
| Referencias UI/UX externas — libs, ferramentas e tendencias | [docs/UI-REFERENCES.md](docs/UI-REFERENCES.md) |
| Backend — endpoints, modulos, como adicionar modulos        | [backend/README.md](backend/README.md)         |

### Estrutura do Projeto

Arvore completa: [README.md - Estrutura do Projeto](README.md#estrutura-do-projeto).

Diretorios-chave em `src/`:

- `app/` — Pages e rotas (App Router, i18n via `[locale]`)
- `components/` — `ui/` (shadcn), `shared/` (compostos reutilizaveis), `layouts/` (sidebar, navbar)
- `lib/` — Logica de negocio: api, auth, datetime, formatters, i18n, masks, search, security, seo, storage, telemetry, validation, utils
- `hooks/` — 25+ custom hooks (importar via barrel `@/hooks`)
- `providers/` — Context providers (auth, query, theme, motion)
- `config/` — Env vars tipadas, constantes, feature flags

### AI Skills (`.cursor/skills/`)

Skills fornecem conhecimento de bibliotecas externas (API reference, breaking changes, migration guides). Indice completo com versoes e comandos de instalacao: [skills.mdc](.cursor/rules/skills.mdc).
