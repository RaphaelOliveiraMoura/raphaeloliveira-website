# Core Stack Backend

Backend API template built with **Fastify** + **Drizzle ORM** + **PostgreSQL**, designed to be the server-side companion of the Core Stack frontend.

## Tech Stack

| Concern        | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Fastify v5                          |
| Language       | TypeScript (strict mode)            |
| ORM            | Drizzle ORM                         |
| Database       | PostgreSQL 17                       |
| Validation     | Zod                                 |
| Authentication | JWT (access + refresh tokens)       |
| API Docs       | Swagger / OpenAPI (auto-generated)  |
| Tests          | Vitest                              |
| Logger         | Pino (structured JSON, Wide Events) |
| Email          | Nodemailer (SMTP) + Console adapter |
| Storage        | AWS S3 / Local filesystem           |
| Metrics        | Prometheus (prom-client)            |
| Security       | Helmet, CORS, Rate Limiting, ETag   |

## Quick Start

### 1. Start PostgreSQL

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

Creates two demo users:

- **Admin:** `admin@corestack.dev` / `password123`
- **User:** `demo@corestack.dev` / `password123`

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

## Project Structure

```
backend/
├── src/
│   ├── app.ts                  # Fastify instance + plugins + service bootstrap
│   ├── server.ts               # Entry point (starts server, graceful shutdown)
│   ├── config/
│   │   ├── env.ts              # Env validation (Zod)
│   │   └── constants.ts        # App constants, roles, error codes
│   ├── db/
│   │   ├── index.ts            # Drizzle connection
│   │   ├── schema/             # Database tables (Drizzle schemas)
│   │   ├── migrations/         # SQL migrations (drizzle-kit)
│   │   └── seed.ts             # Seed script
│   ├── modules/                # Feature modules (domain)
│   │   ├── auth/               # Login, logout, refresh, me, password reset, email verification
│   │   ├── audit/              # Audit log (auto + manual)
│   │   ├── uploads/            # File uploads via storage providers
│   │   ├── users/              # CRUD users (soft delete)
│   │   └── health/             # Health, liveness, readiness probes
│   ├── plugins/                # Fastify plugins
│   │   ├── audit.ts            # Auto audit logging for mutations
│   │   ├── auth.ts             # JWT + cookies
│   │   ├── compress.ts         # Gzip/Brotli response compression
│   │   ├── cors.ts             # CORS
│   │   ├── error-handler.ts    # Global error handler
│   │   ├── etag.ts             # ETag / conditional requests
│   │   ├── helmet.ts           # Security headers (CSP, HSTS, etc.)
│   │   ├── metrics.ts          # Prometheus metrics
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── request-context.ts  # Wide Events / canonical log lines
│   │   └── swagger.ts          # OpenAPI documentation
│   ├── hooks/                  # Pre-handlers (authenticate, authorize)
│   ├── lib/                    # Shared utilities
│   │   ├── base-repository.ts  # Abstract CRUD repository
│   │   ├── container.ts        # DI service container
│   │   ├── crypto.ts           # Tokens, hashes, OTP
│   │   ├── duration.ts         # Duration parsing/formatting
│   │   ├── errors.ts           # Custom error classes
│   │   ├── events.ts           # Typed domain events
│   │   ├── hash.ts             # Password hashing (bcrypt)
│   │   ├── logger.ts           # Pino logger
│   │   ├── pagination.ts       # Pagination helpers
│   │   ├── query-builder.ts    # Generic filter/sort/search
│   │   ├── sanitize.ts         # XSS sanitization
│   │   ├── slug.ts             # URL-friendly slugs
│   │   ├── soft-delete.ts      # Soft delete column helpers
│   │   └── transaction.ts      # DB transaction wrapper
│   ├── services/               # External service adapters (Ports & Adapters)
│   │   ├── mail/               # Email: port, nodemailer adapter, console adapter, templates
│   │   └── storage/            # Storage: port, S3 adapter, local adapter
│   └── types/                  # TypeScript type augmentations
├── tests/                      # Vitest tests
├── drizzle.config.ts           # Drizzle Kit config
├── docker-compose.yml          # PostgreSQL for local dev
├── Dockerfile                  # Production multi-stage build
└── package.json
```

## Architecture

The backend follows a **modular architecture by feature**:

```
Request → Route → [Hooks/Guards] → Service → Repository → Drizzle/DB
```

- **Routes** define endpoints, validate input (Zod), serialize output
- **Services** contain business logic, no direct DB access
- **Repositories** encapsulate Drizzle queries (extend `BaseRepository`)
- **Plugins** handle cross-cutting concerns (auth, CORS, rate limiting, docs, metrics)
- **Hooks** are reusable pre-handlers (authenticate, authorize)

### Ports & Adapters (External Services)

External services (email, storage) follow the **Ports & Adapters** pattern:

- **Ports** — interfaces in `src/services/<name>/<name>.port.ts`
- **Adapters** — concrete implementations (Nodemailer, S3, Local FS, Console)
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

## API Endpoints

### Auth (`/auth`)

| Method | Path                      | Auth | Description                                  |
| ------ | ------------------------- | ---- | -------------------------------------------- |
| POST   | `/auth/login`             | No   | Login with email and password                |
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

Compatible with the Core Stack frontend auth system:

1. **Login:** `POST /auth/login` returns an `accessToken` in the response body and a `refresh-token` in an httpOnly cookie
2. **Authenticated requests:** Send `Authorization: Bearer <accessToken>` header
3. **Token refresh:** `POST /auth/refresh` reads the cookie, rotates the refresh token, and returns a new `accessToken`
4. **Logout:** `POST /auth/logout` revokes the refresh token and clears the cookie

### Security Features

- **Account lockout** — configurable max failed login attempts + lockout duration
- **Refresh token rotation** — old refresh token is revoked on each refresh
- **Password reset** — secure token-based flow with email
- **Email verification** — token-based verification flow
- **Security headers** — Helmet (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting** — configurable per-window limits
- **Input sanitization** — XSS prevention utilities
- **Audit logging** — automatic logging of all mutations

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
6. Run `npm run db:generate && npm run db:migrate`

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
