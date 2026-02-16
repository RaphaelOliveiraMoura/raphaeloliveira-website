# AGENTS.md

> Contexto para agentes de IA que trabalham neste projeto.

## 1 Documentacao

| Assunto                                                     | Fonte                                                |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| Detalhes gerais sobre o projeto                             | [README.md](./README.md)                             |
| Backend — endpoints, modulos, como adicionar modulos        | [backend/README.md](backend/README.md)               |
| Guia para utilizar esse projeto em migrações/criação        | [docs/MIGRANDO_PROJETO.md](docs/MIGRANDO_PROJETO.md) |
| Autenticacao — fluxo ponta a ponta, JWT, refresh, guards    | [docs/AUTH.md](docs/AUTH.md)                         |
| Referencias UI/UX externas — libs, ferramentas e tendencias | [docs/UI-REFERENCES.md](docs/UI-REFERENCES.md)       |

## 2 Regras Gerais

### 2.1 Idioma

- **Codigo** (variaveis, funcoes, componentes, commits, branch names): ingles
- **Documentacao** (README, specs, comentarios de alto nivel, guias): portugues (BR)
- **Comentarios de codigo**: portugues (BR), SOMENTE QUANDO NECESSÁRIO

### 2.2 Convencoes de Nomenclatura

- **Todos os arquivos:** kebab-case (`button.tsx`, `user-card.tsx`, `use-debounce.ts`, `format-currency.ts`)
- **Pastas:** kebab-case (`feature-flags/`, `datetime/`)

### 2.3 Imports

- Sempre usar path alias `@/` que mapeia para `./src/`
- **Excecao**: barrel files (`index.ts`) e testes co-localizados (`*.test.ts`) podem usar `./` para imports do mesmo diretorio
- Preferir importar via barrel file quando disponivel (ex: `@/hooks` em vez de `@/hooks/use-debounce`)

### 2.4 TypeScript

- Strict mode obrigatorio
- **Nunca** usar `any` - usar `unknown` quando o tipo nao e conhecido
- Exportar tipos junto com suas implementacoes
- Generics quando ha reuso de logica com tipos diferentes

### 2.5 Ambiente (Client/Server)

Para verificar se o codigo esta sendo executado no cliente ou servidor, **sempre** usar os utilitarios centralizados:

```ts
import { isClient, isServer } from "@/lib/utils/environment";

// Usar em guards de SSR
if (!isClient()) return null;
if (isServer()) return defaultValue;
```

**Nunca** usar `typeof window !== "undefined"` diretamente no codigo. Sempre importar de `@/lib/utils/environment`.

### 2.6 Logging

Usar o logger centralizado (`@/lib/telemetry/logger`) em vez de `console.*` diretamente:

```ts
import { logger } from "@/lib/telemetry/logger";

logger.error("Mensagem de erro", error);
logger.info("Evento importante", { userId });
```

### 2.7 Boas práticas Error Handling

1. Sempre exibir feedback visual ao usuario quando ocorre um erro
2. Sempre oferecer opcao de "Tentar novamente" quando possivel
3. Logar erros com contexto suficiente para debug
4. Nao expor detalhes tecnicos ao usuario em producao
5. Usar `ErrorBoundary` em torno de secoes que podem falhar independentemente

### 2.8 Hooks

Preferir hooks centralizados ao inves de implementacoes ad-hoc:

| Em vez de                               | Usar                                  | Motivo                                                                      |
| --------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `useState(false)` + toggle manual       | `useToggle`                           | API mais limpa (excecao: quando precisa de `setOpen(true/false)` explicito) |
| `setTimeout` para debounce              | `useDebounce`                         | Cleanup automatico, sem memory leaks                                        |
| `onBlur` + timeout para click fora      | `useOnClickOutside`                   | Mais confiavel com refs                                                     |
| `localStorage`/`sessionStorage` direto  | `useLocalStorage`/`useSessionStorage` | SSR-safe, reativo, tipado                                                   |
| `window.matchMedia` para responsividade | `useIsMobile`/`useBreakpoint`         | SSR-safe, reativo                                                           |
| Animacao sem checar acessibilidade      | `useReducedMotion`                    | Respeita `prefers-reduced-motion`                                           |
| Verificacao manual de permissoes        | `usePermissions`                      | API consistente (requer `AuthProvider`)                                     |

#### 2.8.1 Hooks Disponiveis

| Hook                      | Descricao                                  |
| ------------------------- | ------------------------------------------ |
| `useDebounce`             | Debounce de valores                        |
| `useThrottle`             | Throttle de valores                        |
| `useToggle`               | Estado booleano com toggle                 |
| `usePrevious`             | Valor anterior de um estado                |
| `useLocalStorage`         | Persistencia em localStorage               |
| `useSessionStorage`       | Persistencia em sessionStorage             |
| `useMediaQuery`           | Media query reativa                        |
| `useBreakpoint`           | Breakpoint atual (xs/sm/md/lg/xl/2xl)      |
| `useIsMobile`             | Verifica se e mobile (<768px)              |
| `useIsTablet`             | Verifica se e tablet (768-1024px)          |
| `useIsDesktop`            | Verifica se e desktop (>1024px)            |
| `useWindowSize`           | Dimensoes da janela                        |
| `useScrollPosition`       | Posicao de scroll                          |
| `useOnClickOutside`       | Detecta click fora de um elemento          |
| `useEventListener`        | Adiciona event listener de forma segura    |
| `useKeyboardShortcut`     | Atalhos de teclado                         |
| `useClipboard`            | Copiar para clipboard                      |
| `useOnlineStatus`         | Detecta status online/offline              |
| `useReducedMotion`        | Preferencia de animacao reduzida           |
| `useIntersectionObserver` | Observar visibilidade de elementos         |
| `useObjectUrl`            | Criar/revogar Object URLs                  |
| `usePermissions`          | Verificar permissoes (requer AuthProvider) |
| `useFeatureFlag`          | Verificar feature flags                    |
| `useCookieConsent`        | Gerenciar consentimento de cookies         |
| `useUrlState`             | Estado sincronizado com URL params         |
| `useUrlPagination`        | Paginacao sincronizada com URL             |
| `usePWAInstall`           | Prompt de instalacao PWA                   |
| `useShare`                | Web Share API                              |

### 2.9 i18n

- Todo texto visivel ao usuario em componentes `.tsx` **deve** usar `useTranslations` (client) ou `getTranslations` (server). Strings literais em qualquer idioma sao proibidas.
- Quando o texto traduzido contem elementos interativos (links, negrito, etc.), usar `t.rich()` com **tags XML nas mensagens** (NAO interpolacao `{}`).
- `{variavel}` → interpolacao de texto simples (`t("key", { variavel: valor })`)
- `<tag>conteudo</tag>` → rich text com callback JSX (`t.rich("key", { tag: (chunks) => <El>{chunks}</El> })`)
- **NUNCA** misturar: nao passe funcoes para variaveis `{}`; isso causa o erro _"Functions are not valid as a child of Client Components"_
- `t.rich()` com callbacks JSX requer `"use client"` no componente

- Para adicionar um novo namespace:

1. Criar o JSON em `messages/{locale}/novo-namespace.json` para todos os locales
2. Importar em `src/i18n/request.ts` no merge de messages
3. Atualizar a tipagem em `src/types/i18n.ts`

### 2.10 Componentes

- Sempre usar elementos semanticos (`button`, `nav`, `main`, `section`)
- Incluir `aria-label` quando o texto visual nao e suficiente
- Garantir navegacao por teclado (Tab, Enter, Escape)
- Testar com screen reader quando possivel

- Props sempre tipadas com `interface`
- Usar `ComponentProps<>` para estender elementos HTML nativos

- Preferir composicao sobre heranca
- Usar compound components para componentes complexos
- Aceitar `children` quando fizer sentido
- Componentes que precisam expor ref do DOM devem aceitar `ref` como prop (React 19 — `forwardRef` nao e mais necessario)

- Tailwind CSS para estilos
- `cn()` (clsx + twMerge) para merge de classes condicionais
- CSS variables para valores dinamicos (cores do tema, etc.)
- Nunca usar `style` inline exceto para valores realmente dinamicos

- React Compiler esta habilitado - evitar `useMemo`/`useCallback` manuais (quando necessario, seguir as regras de `linting.mdc`)
- Extrair componentes pesados com `dynamic()` para lazy loading
- Evitar re-renders desnecessarios (elevar estado so quando necessario)

**Ao criar um componente novo**, pergunte-se:

- Usa hooks ou eventos? → `"use client"`
- E puramente de apresentacao com dados estaticos? → Server Component (sem diretiva)
- Recebe funcoes como props/children? → Provavelmente precisa de `"use client"`

## 3 Tech Stack

### 3.1 Frontend

| Tecnologia                                    | Versao | Proposito                          |
| --------------------------------------------- | ------ | ---------------------------------- |
| [Next.js](https://nextjs.org/)                | 16     | Framework React com App Router     |
| [React](https://react.dev/)                   | 19     | Biblioteca UI com React Compiler   |
| [TypeScript](https://www.typescriptlang.org/) | 5      | Tipagem estatica                   |
| [Tailwind CSS](https://tailwindcss.com/)      | 4      | Estilizacao utility-first          |
| [shadcn/ui](https://ui.shadcn.com/)           | -      | Componentes acessiveis (Radix UI)  |
| [Storybook](https://storybook.js.org/)        | -      | Documentacao visual de componentes |
| [Vitest](https://vitest.dev/)                 | 4      | Testes unitarios e de integracao   |
| [Playwright](https://playwright.dev/)         | -      | Testes end-to-end                  |

### 3.2 Backend

| Tecnologia                                                  | Versao | Proposito                                |
| ----------------------------------------------------------- | ------ | ---------------------------------------- |
| [Fastify](https://fastify.dev/)                             | 5      | Framework HTTP de alta performance       |
| [TypeScript](https://www.typescriptlang.org/)               | 5      | Tipagem estatica (strict mode)           |
| [Drizzle ORM](https://orm.drizzle.team/)                    | 0.44   | ORM type-safe para PostgreSQL            |
| [PostgreSQL](https://www.postgresql.org/)                   | 17     | Banco de dados relacional                |
| [Zod](https://zod.dev/)                                     | 3      | Validacao de schemas e env vars          |
| [Pino](https://getpino.io/)                                 | 10     | Logger estruturado (Wide Events pattern) |
| JWT (`@fastify/jwt`)                                        | 9      | Autenticacao (access + refresh tokens)   |
| [Swagger/OpenAPI](https://swagger.io/) (`@fastify/swagger`) | 9      | Documentacao de API auto-gerada          |
| [Vitest](https://vitest.dev/)                               | 3      | Testes unitarios e de integracao         |

## 4 Estrutura de Pastas

### 4.1 Frontend

```
src/
├── app/              → Pages e rotas (Next.js App Router)
├── components/
│   ├── ui/           → Componentes shadcn/ui
│   ├── shared/       → Componentes compostos reutilizaveis
│   └── layouts/      → Layouts (sidebar, navbar, page wrappers)
├── lib/              → Logica de negocio e utilitarios
│   ├── api/          → HTTP client, interceptors, React Query config
│   ├── auth/         → Autenticacao, tokens, guards
│   ├── datetime/     → Manipulacao de datas e timezones
│   ├── feature-flags/→ Sistema de feature toggles
│   ├── formatters/   → Formatadores (moeda, documentos, strings)
│   ├── i18n/         → Internacionalizacao
│   ├── masks/        → Mascaras de input
│   ├── search/       → Logica de busca global
│   ├── security/     → Sanitizacao, CSRF
│   ├── seo/          → Utilitarios SEO
│   ├── storage/      → Wrappers localStorage/sessionStorage/cookies
│   ├── telemetry/    → Logs, analytics, error tracking
│   ├── validation/   → Schemas Zod
│   └── utils/        → Utilitarios gerais
├── hooks/            → Custom React hooks
├── providers/        → Context providers (theme, auth, i18n, etc.)
├── styles/           → Estilos globais, tokens CSS
├── types/            → Tipos TypeScript globais
└── config/           → Env vars schema, constantes
```

### 4.2 Backend

```
backend/
├── src/
│   ├── app.ts                  # Fastify instance + plugins + service bootstrap
│   ├── server.ts               # Entry point (starts server, graceful shutdown)
│   ├── config/
│   │   ├── env.ts              # Env validation (Zod)
│   │   └── constants.ts        # App constants, roles, error codes, scopes
│   ├── db/
│   │   ├── index.ts            # Drizzle connection
│   │   ├── schema/             # Database tables (Drizzle schemas)
│   │   ├── migrations/         # SQL migrations (drizzle-kit)
│   │   └── seed.ts             # Seed script (users, roles, permissions, flags)
│   ├── modules/                # Feature modules (domain)
│   │   ├── api-keys/           # API key management (create, list, revoke)
│   │   ├── auth/               # Login, logout, refresh, social login, password reset
│   │   ├── audit/              # Audit log (auto + manual)
│   │   ├── feature-flags/      # Dynamic feature toggles with conditions
│   │   ├── health/             # Health, liveness, readiness probes
│   │   ├── notifications/      # In-app notifications with preferences
│   │   ├── roles/              # RBAC roles and permissions management
│   │   ├── sessions/           # Session management (list, revoke)
│   │   ├── settings/           # System and user settings/preferences
│   │   ├── uploads/            # File uploads via storage providers
│   │   ├── users/              # CRUD users (soft delete)
│   │   └── webhooks/           # Webhook subscriptions + delivery log
│   ├── plugins/                # Fastify plugins
│   │   ├── audit.ts            # Auto audit logging for mutations
│   │   ├── auth.ts             # JWT + cookies
│   │   ├── compress.ts         # Gzip/Brotli response compression
│   │   ├── cors.ts             # CORS
│   │   ├── error-handler.ts    # Global error handler
│   │   ├── etag.ts             # ETag / conditional requests
│   │   ├── helmet.ts           # Security headers (CSP, HSTS, etc.)
│   │   ├── idempotency.ts      # Idempotency keys for safe retries
│   │   ├── metrics.ts          # Prometheus metrics
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── request-context.ts  # Wide Events / canonical log lines
│   │   └── swagger.ts          # OpenAPI documentation
│   ├── hooks/                  # Pre-handlers
│   │   ├── authenticate.ts     # JWT + API key authentication (fallback)
│   │   ├── authenticate-api-key.ts  # API key auth hook
│   │   ├── authorize.ts        # Role-based authorization
│   │   └── require-permission.ts    # Granular permission check
│   ├── lib/                    # Shared utilities
│   │   ├── base-repository.ts  # Abstract CRUD repository
│   │   ├── container.ts        # DI service container
│   │   ├── crypto.ts           # Tokens, hashes, OTP
│   │   ├── duration.ts         # Duration parsing/formatting
│   │   ├── errors.ts           # Custom error classes
│   │   ├── events.ts           # Typed domain events
│   │   ├── feature-flags.ts    # Feature flag evaluator
│   │   ├── full-text-search.ts # PostgreSQL tsvector/tsquery helpers
│   │   ├── hash.ts             # Password hashing (bcrypt)
│   │   ├── logger.ts           # Pino logger
│   │   ├── pagination.ts       # Pagination helpers
│   │   ├── query-builder.ts    # Generic filter/sort/search + FTS
│   │   ├── sanitize.ts         # XSS sanitization
│   │   ├── scheduler.ts        # Cron job registration
│   │   ├── slug.ts             # URL-friendly slugs
│   │   ├── soft-delete.ts      # Soft delete column helpers
│   │   └── transaction.ts      # DB transaction wrapper
│   ├── services/               # External service adapters (Ports & Adapters)
│   │   ├── cache/              # Cache: port, Redis adapter, memory adapter
│   │   ├── firebase/           # Firebase Auth: ID token verification
│   │   ├── mail/               # Email: port, nodemailer adapter, console adapter
│   │   ├── queue/              # Queue: port, BullMQ adapter, memory adapter, workers
│   │   └── storage/            # Storage: port, S3 adapter, local adapter
│   └── types/                  # TypeScript type augmentations
├── tests/                      # Vitest tests
├── drizzle.config.ts           # Drizzle Kit config
├── docker-compose.yml          # PostgreSQL + Redis for local dev
├── Dockerfile                  # Production multi-stage build
└── package.json
```
