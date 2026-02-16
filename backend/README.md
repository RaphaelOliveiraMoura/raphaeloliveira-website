# Core Stack Backend

Backend API template built with **Fastify** + **Drizzle ORM** + **PostgreSQL**, designed to be the server-side companion of the Core Stack frontend.

## Tech Stack

| Concern        | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | Fastify v5                              |
| Language       | TypeScript (strict mode)                |
| ORM            | Drizzle ORM                             |
| Database       | PostgreSQL 17                           |
| Cache          | Redis (ioredis) / In-memory             |
| Queue          | BullMQ (Redis) / In-memory              |
| Validation     | Zod                                     |
| Authentication | JWT + API Keys + Firebase Auth (Social) |
| Authorization  | RBAC (roles + granular permissions)     |
| API Docs       | Swagger / OpenAPI (auto-generated)      |
| Tests          | Vitest                                  |
| Logger         | Pino (structured JSON, Wide Events)     |
| Email          | Nodemailer (SMTP) + Console adapter     |
| Storage        | AWS S3 / Local filesystem               |
| Metrics        | Prometheus (prom-client)                |
| Security       | Helmet, CORS, Rate Limiting, ETag, HMAC |

## Quick Start

### 1. Start PostgreSQL + Redis

```bash
docker compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env as needed
```

### 4. Run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed the database (optional)

```bash
npm run db:seed
```

Creates:

- **Demo users:** `admin@corestack.dev` / `demo@corestack.dev` (password: `password123`)
- **Default roles:** `admin` (all permissions) and `user` (limited permissions)
- **Default permissions:** CRUD for all resources
- **Default feature flags:** social-login, webhooks, api-keys, notifications

### 6. Start dev server

```bash
npm run dev
```

The API runs at `http://localhost:3001` and Swagger docs at `http://localhost:3001/docs`.

## Scripts

| Script                  | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Start dev server with hot reload       |
| `npm run build`         | Build for production                   |
| `npm start`             | Start production server                |
| `npm run db:generate`   | Generate Drizzle migrations            |
| `npm run db:migrate`    | Apply migrations                       |
| `npm run db:push`       | Push schema directly (no migration)    |
| `npm run db:studio`     | Open Drizzle Studio (visual DB editor) |
| `npm run db:seed`       | Seed database with demo data           |
| `npm test`              | Run tests                              |
| `npm run test:coverage` | Run tests with coverage                |
| `npm run typecheck`     | TypeScript type checking               |

> **Lint & Format** are managed from the root project. Run `npm run lint` and `npm run format` from the repository root.

## Architecture

### Premissas Gerais

Todas as features seguem os padroes abaixo de forma consistente:

1. **Ports & Adapters** — Servicos externos (mail, storage, cache, queue, firebase) sao definidos como interfaces (`src/services/<name>/<name>.port.ts`) com implementacoes concretas intercambiaveis (Redis/Memory, BullMQ/Memory, S3/Local, SMTP/Console).

2. **DI Container** — `src/lib/container.ts` registra adapters no bootstrap (`app.ts`); modulos resolvem dependencias por chave tipada (`container.resolve("cache")`), sem acoplamento a implementacoes.

3. **Domain Events** — `src/lib/events.ts` fornece um event emitter tipado (`DomainEventMap`) para integracao desacoplada entre modulos. Listeners registrados no bootstrap; erros em handlers sao isolados e logados.

4. **Modular Architecture** — Cada dominio vive em `src/modules/<name>/` com arquivos padrao: `routes.ts`, `service.ts`, `repository.ts`, `schemas.ts`, `types.ts`, `listener.ts` (quando aplicavel).

5. **Zod Validation & Serialization** — `fastify-type-provider-zod` valida input e serializa output automaticamente. Schemas definidos em `*.schemas.ts`, tipos inferidos via `z.infer<>`, documentacao OpenAPI gerada a partir dos mesmos schemas.

6. **Wide Events / Canonical Log Lines** — `src/plugins/request-context.ts` emite uma unica linha de log estruturada por request no `onResponse`, enriquecida progressivamente pelos handlers via `request.ctx` (userId, action, resource, error, duration).

7. **Typed Error Hierarchy** — `src/lib/errors.ts` define `AppError` como base, com subclasses tipadas (`NotFoundError`, `ForbiddenError`, `ConflictError`, etc.) mapeadas para HTTP status codes e error codes centralizados em `src/config/constants.ts`.

8. **Global Error Handler** — `src/plugins/error-handler.ts` intercepta todas as exceptions (AppError, ZodError, Fastify errors) e normaliza para um formato de resposta unico: `{ code, message, status, details? }`.

9. **BaseRepository + Soft Delete** — `src/lib/base-repository.ts` oferece CRUD generico com suporte a soft-delete opcional via `deletedAt`. Todos os metodos aceitam `tx?: Transaction` para composicao transacional.

10. **Transaction Wrapper** — `src/lib/transaction.ts` encapsula operacoes atomicas via `withTransaction(fn)`. Repositories usam `resolveExecutor(tx)` para operar tanto dentro quanto fora de transacoes.

11. **Audit Automatico** — `src/plugins/audit.ts` loga automaticamente todas as mutacoes (POST/PUT/PATCH/DELETE com 2xx/3xx) usando dados de `request.ctx`, sem codigo adicional nos handlers.

12. **Idempotency Keys** — `src/plugins/idempotency.ts` intercepta requests com header `Idempotency-Key` em mutacoes. Usa lock + cache + DB para prevenir processamento duplicado e replay de respostas anteriores.

13. **Authentication Fallback** — `src/hooks/authenticate.ts` tenta JWT primeiro (`Authorization: Bearer`), depois API Key (`X-API-Key`) como fallback. Hook unico que abstrai o metodo de autenticacao para os handlers.

14. **RBAC Granular** — `src/hooks/require-permission.ts` verifica permissoes por recurso+acao (ex: `users.create`, `uploads.delete`) cacheadas por role, complementando a autorizacao basica por role via `authorize()`.

15. **Graceful Shutdown** — `src/server.ts` executa uma sequencia ordenada: drain connections, remove event listeners, close queue workers, close cache, clear container, close database. Timeout de 30s com force exit.

### Fluxo de Request

```
Request → Route → [Hooks/Guards] → Service → Repository → Drizzle/DB
```

| Camada           | Responsabilidade                                                            |
| ---------------- | --------------------------------------------------------------------------- |
| **Routes**       | Definem endpoints, validam input (Zod), serializam output, enriquecem `ctx` |
| **Services**     | Logica de negocio, sem acesso direto ao banco                               |
| **Repositories** | Encapsulam queries Drizzle (estendem `BaseRepository`)                      |
| **Plugins**      | Concerns transversais (auth, CORS, rate limiting, docs, metrics, audit)     |
| **Hooks**        | Pre-handlers reutilizaveis (authenticate, authorize, require-permission)    |

### Ports & Adapters (External Services)

External services (email, storage, cache, queue) follow the **Ports & Adapters** pattern:

- **Ports** — interfaces in `src/services/<name>/<name>.port.ts`
- **Adapters** — concrete implementations (Redis, BullMQ, Nodemailer, S3, Local FS, Console, Memory)
- **Container** — `src/lib/container.ts` registers adapters at bootstrap; services resolve them by key

This avoids coupling application code to specific libraries.

### Domain Events

The typed event system (`src/lib/events.ts`) allows modules to react to domain events without direct coupling:

```ts
domainEvents.emit("user.created", {
  userId: "...",
  email: "...",
  role: "user",
});
domainEvents.on("user.created", async (payload) => {
  await sendWelcomeEmail(payload.email);
});
```

Used by: **Notifications** (in-app notifications on events), **Webhooks** (dispatch to external URLs), **Audit** (automatic audit logging).

## API Endpoints

### Auth (`/auth`)

| Method | Path                      | Auth | Description                                  |
| ------ | ------------------------- | ---- | -------------------------------------------- |
| POST   | `/auth/login`             | No   | Login with email and password                |
| POST   | `/auth/social`            | No   | Social login via Firebase (Google/GitHub)    |
| POST   | `/auth/refresh`           | No   | Refresh access token (cookie, with rotation) |
| POST   | `/auth/logout`            | No   | Revoke refresh token                         |
| GET    | `/auth/me`                | Yes  | Get authenticated user profile               |
| POST   | `/auth/forgot-password`   | No   | Request password reset email                 |
| POST   | `/auth/reset-password`    | No   | Reset password with token                    |
| POST   | `/auth/send-verification` | Yes  | Send email verification link                 |
| POST   | `/auth/verify-email`      | No   | Verify email with token                      |

### Users (`/users`)

| Method | Path         | Auth  | Description                    |
| ------ | ------------ | ----- | ------------------------------ |
| GET    | `/users`     | Yes   | List users (paginated, search) |
| GET    | `/users/:id` | Yes   | Get user by ID                 |
| POST   | `/users`     | Admin | Create user                    |
| PATCH  | `/users/:id` | Admin | Update user                    |
| DELETE | `/users/:id` | Admin | Soft-delete user               |

### Sessions (`/sessions`)

| Method | Path            | Auth | Description                        |
| ------ | --------------- | ---- | ---------------------------------- |
| GET    | `/sessions`     | Yes  | List active sessions               |
| DELETE | `/sessions/:id` | Yes  | Revoke a specific session          |
| DELETE | `/sessions`     | Yes  | Revoke all sessions except current |

### API Keys (`/api-keys`)

| Method | Path            | Auth | Description                             |
| ------ | --------------- | ---- | --------------------------------------- |
| POST   | `/api-keys`     | Yes  | Create API key (secret shown only once) |
| GET    | `/api-keys`     | Yes  | List API keys (without secret)          |
| DELETE | `/api-keys/:id` | Yes  | Revoke API key                          |

### Roles & Permissions (`/roles`, `/permissions`)

| Method | Path                     | Auth  | Description                       |
| ------ | ------------------------ | ----- | --------------------------------- |
| GET    | `/roles`                 | Admin | List roles with permissions       |
| POST   | `/roles`                 | Admin | Create custom role                |
| PATCH  | `/roles/:id`             | Admin | Update role                       |
| DELETE | `/roles/:id`             | Admin | Delete role (except system roles) |
| PUT    | `/roles/:id/permissions` | Admin | Set permissions for a role        |
| GET    | `/permissions`           | Admin | List all available permissions    |

### Notifications (`/notifications`)

| Method | Path                          | Auth | Description                     |
| ------ | ----------------------------- | ---- | ------------------------------- |
| GET    | `/notifications`              | Yes  | List notifications (paginated)  |
| GET    | `/notifications/unread-count` | Yes  | Get unread count                |
| PATCH  | `/notifications/:id/read`     | Yes  | Mark as read                    |
| POST   | `/notifications/read-all`     | Yes  | Mark all as read                |
| DELETE | `/notifications/:id`          | Yes  | Delete notification             |
| GET    | `/notifications/preferences`  | Yes  | Get notification preferences    |
| PUT    | `/notifications/preferences`  | Yes  | Update notification preferences |

### Feature Flags (`/feature-flags`)

| Method | Path                      | Auth  | Description                         |
| ------ | ------------------------- | ----- | ----------------------------------- |
| GET    | `/feature-flags`          | Admin | List all flags                      |
| POST   | `/feature-flags`          | Admin | Create flag                         |
| PATCH  | `/feature-flags/:id`      | Admin | Update flag                         |
| DELETE | `/feature-flags/:id`      | Admin | Delete flag                         |
| GET    | `/feature-flags/evaluate` | Yes   | Evaluate all flags for current user |

### Settings (`/settings`)

| Method | Path               | Auth  | Description                                     |
| ------ | ------------------ | ----- | ----------------------------------------------- |
| GET    | `/settings`        | Yes   | Get user settings (merged with system defaults) |
| PUT    | `/settings`        | Yes   | Update user settings (batch)                    |
| GET    | `/settings/system` | Admin | Get system settings                             |
| PUT    | `/settings/system` | Admin | Update system settings                          |

### Webhooks (`/webhooks`)

| Method | Path                       | Auth | Description                  |
| ------ | -------------------------- | ---- | ---------------------------- |
| POST   | `/webhooks`                | Yes  | Create webhook (secret once) |
| GET    | `/webhooks`                | Yes  | List webhooks                |
| PATCH  | `/webhooks/:id`            | Yes  | Update webhook               |
| DELETE | `/webhooks/:id`            | Yes  | Delete webhook               |
| GET    | `/webhooks/:id/deliveries` | Yes  | List delivery history        |
| POST   | `/webhooks/:id/test`       | Yes  | Send test event              |

### Uploads (`/uploads`)

| Method | Path           | Auth | Description               |
| ------ | -------------- | ---- | ------------------------- |
| POST   | `/uploads`     | Yes  | Upload a file             |
| GET    | `/uploads`     | Yes  | List uploads (paginated)  |
| GET    | `/uploads/:id` | Yes  | Get upload metadata + URL |
| DELETE | `/uploads/:id` | Yes  | Delete upload             |

### Audit (`/audit`)

| Method | Path     | Auth  | Description                 |
| ------ | -------- | ----- | --------------------------- |
| GET    | `/audit` | Admin | List audit logs (paginated) |

### Health (`/health`)

| Method | Path            | Auth | Description                             |
| ------ | --------------- | ---- | --------------------------------------- |
| GET    | `/health`       | No   | Health check (status + DB connectivity) |
| GET    | `/health/live`  | No   | Liveness probe (process alive + memory) |
| GET    | `/health/ready` | No   | Readiness probe (DB + mail + storage)   |

### Monitoring

| Method | Path       | Auth | Description                   |
| ------ | ---------- | ---- | ----------------------------- |
| GET    | `/metrics` | No   | Prometheus-compatible metrics |

## Authentication Flow

### JWT (Primary)

1. **Login:** `POST /auth/login` returns an `accessToken` in the response body and a `refresh-token` in an httpOnly cookie
2. **Authenticated requests:** Send `Authorization: Bearer <accessToken>` header
3. **Token refresh:** `POST /auth/refresh` reads the cookie, rotates the refresh token, and returns a new `accessToken`
4. **Logout:** `POST /auth/logout` revokes the refresh token and clears the cookie

### Social Login (Firebase)

1. **Client-side:** User signs in with Google/GitHub/Apple via Firebase SDK
2. **Client sends:** `POST /auth/social { provider, idToken }`
3. **Backend verifies:** Firebase ID token, creates or links user account
4. **Returns:** Same JWT pair as regular login

### API Key Authentication

1. **Create:** `POST /api-keys` returns a full key (shown once)
2. **Use:** Send `X-API-Key: <key>` header
3. **Backend:** Extracts prefix, looks up hash, validates scopes

The authenticate hook tries JWT first, then falls back to API key if the `X-API-Key` header is present.

### Security Features

- **Account lockout** — configurable max failed login attempts + lockout duration
- **Refresh token rotation** — old refresh token is revoked on each refresh
- **Password reset** — secure token-based flow with email
- **Email verification** — token-based verification flow
- **RBAC** — roles with granular permissions, cached for performance
- **API key scopes** — fine-grained access control for integrations
- **Idempotency keys** — safe retries for POST/PUT/PATCH operations
- **Security headers** — Helmet (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting** — configurable per-window limits
- **Input sanitization** — XSS prevention utilities
- **Audit logging** — automatic logging of all mutations
- **Webhook HMAC** — payload signed with HMAC-SHA256 for verification

## Background Jobs & Scheduling

### Job Queue

BullMQ-based job queue with Redis (falls back to in-memory for dev):

- **Email delivery** — async email sending with retry
- **Webhook delivery** — POST to external URLs with HMAC signing and retry
- **Cleanup** — expired tokens, sessions, idempotency keys

### Scheduled Jobs (Cron)

| Schedule      | Job                         | Description                     |
| ------------- | --------------------------- | ------------------------------- |
| `0 0 * * *`   | `cleanup:expired-tokens`    | Clean up expired refresh tokens |
| `0 * * * *`   | `cleanup:inactive-sessions` | Remove inactive sessions        |
| `0 */6 * * *` | `cleanup:idempotency-keys`  | Purge expired idempotency keys  |

## Environment Variables

See `.env.example` for all available variables with descriptions. Key groups:

| Group    | Variables                                                              |
| -------- | ---------------------------------------------------------------------- |
| Server   | `PORT`, `HOST`, `NODE_ENV`                                             |
| Database | `DATABASE_URL`                                                         |
| JWT      | `JWT_SECRET`, `JWT_ACCESS/REFRESH_EXPIRATION`                          |
| CORS     | `CORS_ORIGIN`                                                          |
| Cache    | `CACHE_DRIVER`, `REDIS_URL`                                            |
| Queue    | `QUEUE_DRIVER`                                                         |
| Mail     | `MAIL_DRIVER`, `SMTP_*`                                                |
| Storage  | `STORAGE_DRIVER`, `S3_*`                                               |
| Firebase | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |

## Frontend Integration

Set the backend URL in the frontend `.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

The frontend's `apiClient` and auth interceptor will work with this backend out of the box.

## Adding a New Module

1. Create a folder in `src/modules/<name>/`
2. Add these files:
   - `<name>.routes.ts` — Fastify route definitions
   - `<name>.service.ts` — Business logic
   - `<name>.repository.ts` — Database queries (extend `BaseRepository`)
   - `<name>.schemas.ts` — Zod validation schemas
   - `<name>.types.ts` — TypeScript types
3. Register routes in `src/app.ts`:
   ```ts
   import { myRoutes } from "./modules/my/my.routes.js";
   await app.register(myRoutes, { prefix: "/my" });
   ```
4. In each route handler, enrich `request.ctx` with action and resource:
   ```ts
   request.ctx.action = "my.create";
   request.ctx.resource = { type: "my", id: result.id };
   ```
5. Add Drizzle schema in `src/db/schema/` if needed
6. Export from `src/db/schema/index.ts`
7. Run `npm run db:generate && npm run db:migrate`

## Observability / Logging

The backend uses a **Wide Events / Canonical Log Lines** pattern for structured logging:

- **One log line per request** -- The `request-context` plugin emits a single, context-rich JSON log line when each request completes
- **Structured JSON in production** -- Every log line is valid JSON with high-cardinality fields (`userId`, `requestId`, `action`, `statusCode`, `durationMs`, `error.*`)
- **Enriched by handlers** -- Each route handler and hook adds domain context to `request.ctx`, which is included in the canonical log line
- **Human-readable in dev** -- `pino-pretty` formats logs for developer readability
- **Child loggers for non-request contexts** -- Startup, shutdown, seed, and DB lifecycle use `logger.child({ module: "..." })`
- **Prometheus metrics** -- `GET /metrics` exposes request duration, request count, active connections, and default Node.js metrics

### Log levels

| Level   | When                                                                |
| ------- | ------------------------------------------------------------------- |
| `fatal` | Server failed to start                                              |
| `error` | Unexpected 500 errors                                               |
| `warn`  | Auth failures (401), forbidden (403), validation (400), DB degraded |
| `info`  | Successful requests (2xx), startup, shutdown                        |
| `debug` | Detailed troubleshooting (enable via `LOG_LEVEL=debug`)             |

### Example canonical log line (production JSON)

```json
{
  "level": 30,
  "time": "2026-02-12T22:00:00.000Z",
  "service": "core-stack-api",
  "env": "production",
  "requestId": "req-abc123",
  "method": "POST",
  "path": "/users",
  "statusCode": 201,
  "durationMs": 47,
  "userId": "uuid-admin",
  "userRole": "admin",
  "action": "user.create",
  "resource": { "type": "user", "id": "uuid-new" },
  "outcome": "success",
  "msg": "request completed"
}
```

---

## Utilitarios Cross-cutting

### Retry com Exponential Backoff (`src/lib/retry.ts`)

Wrapper generico para retry de operacoes falhas com backoff exponencial e jitter.

```typescript
import { withRetry } from "@/lib/retry";

const result = await withRetry(() => sendEmail(to, subject, body), {
  maxRetries: 3, // Numero maximo de retries
  baseDelay: 1000, // Delay base em ms
  maxDelay: 30000, // Delay maximo (cap)
  jitter: true, // Adiciona randomizacao para evitar thundering herd
  retryIf: (err) => err instanceof NetworkError, // Filtro de erros retryable
  signal: abortController.signal, // Cancelamento
});
```

### Circuit Breaker (`src/lib/circuit-breaker.ts`)

Protege chamadas a servicos externos com o padrao Circuit Breaker (CLOSED → OPEN → HALF_OPEN).

```typescript
import { CircuitBreaker, CircuitOpenError } from "@/lib/circuit-breaker";

const breaker = new CircuitBreaker("smtp", {
  failureThreshold: 5, // Falhas consecutivas para abrir o circuito
  resetTimeout: 30000, // Tempo em OPEN antes de tentar HALF_OPEN
  halfOpenMax: 1, // Sucessos em HALF_OPEN para fechar
});

try {
  await breaker.execute(() => sendEmail(to, subject, body));
} catch (err) {
  if (err instanceof CircuitOpenError) {
    // Circuito aberto — usar fallback
  }
}
```

### Data Export (`src/lib/export.ts`)

Utilitario generico para exportar entidades como CSV ou JSON com streaming.

```typescript
import { sendExport } from "@/lib/export";

// Em um route handler:
await sendExport(reply, users, {
  format: "csv",
  filename: "users",
  columns: [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    {
      key: "createdAt",
      header: "Criado em",
      transform: (v) => new Date(v as string).toLocaleDateString(),
    },
  ],
});
```

Rotas de exemplo: `GET /users/export?format=csv`, `GET /audit/export?format=json`.

### Bulk Operations (`src/lib/bulk.ts`)

Operacoes em lote com dois modos de transacao:

```typescript
import { bulkCreate, bulkUpdate, bulkDelete } from "@/lib/bulk";

// best_effort: erros sao coletados, sucessos sao mantidos
const result = await bulkCreate(items, (item) => repo.create(item), {
  transaction: "best_effort",
  batchSize: 100,
});
// result: { total, succeeded, failed, errors: [{ index, error }], data: [...] }

// all_or_nothing: tudo em uma transacao, qualquer falha faz rollback
const result = await bulkCreate(items, (item, tx) => repo.create(item, tx), {
  transaction: "all_or_nothing",
});
```

---

## Padroes de Query Avancados

### Offset vs Cursor Pagination

| Padrao                      | Quando usar                                         | Vantagens                           | Desvantagens                                          |
| --------------------------- | --------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| **Offset** (`page/limit`)   | Listagens com total, tabelas com paginacao numerica | Simples, suporta "ir para pagina X" | Inconsistente com insercoes, lento em offsets grandes |
| **Cursor** (`cursor/limit`) | Feeds infinitos, scroll infinito, real-time         | Consistente, performante            | Nao suporta "ir para pagina X", sem total             |

```typescript
// Offset (padrao existente)
import { paginationSchema, paginate, getOffset } from "@/lib/pagination";

// Cursor (novo)
import {
  cursorPaginationSchema,
  cursorPaginate,
  encodeCursor,
  decodeCursor,
} from "@/lib/pagination";

// No repository:
const rows = await db
  .select()
  .from(table)
  .limit(limit + 1)
  .where(gt(table.id, cursorId));
return cursorPaginate(rows, limit, "id");
```

### JOINs com Drizzle + groupJoinResults

Para entidades com relacoes (1:N), use LEFT JOIN + `groupJoinResults` em vez de queries separadas (N+1):

```typescript
import { groupJoinResults } from "@/lib/query-builder";

// Query com LEFT JOIN
const rows = await db
  .select({
    id: roles.id,
    name: roles.name,
    permId: permissions.id,
    permKey: permissions.key,
  })
  .from(roles)
  .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
  .leftJoin(permissions, eq(permissions.id, rolePermissions.permissionId));

// Agrupar em parent + children
const grouped = groupJoinResults(rows, "id", {
  permissions: { idKey: "permId", fields: ["permId", "permKey"] },
});
```

### Listagens complexas com filtros + sort + search + FTS

Padrao recomendado para entidades complexas:

```typescript
import {
  buildFilters,
  buildSearch,
  buildOrderBy,
  combineConditions,
  buildSmartSearch,
} from "@/lib/query-builder";

// 1. Construir filtros dinamicos
const filterWhere = buildFilters([
  { column: table.status, operator: "eq", value: query.status },
  { column: table.createdAt, operator: "gte", value: query.after },
]);

// 2. Busca inteligente (FTS com fallback para ILIKE)
const searchWhere = buildSmartSearch(query.search, [
  table.title,
  table.description,
]);

// 3. Combinar condicoes
const where = combineConditions(filterWhere, searchWhere);

// 4. Ordenacao dinamica
const orderBy = buildOrderBy(query.sort, query.order, {
  createdAt: table.createdAt,
  title: table.title,
});
```
