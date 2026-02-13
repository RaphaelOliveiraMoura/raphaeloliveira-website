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
│   ├── app.ts                  # Fastify instance + plugins + error handler
│   ├── server.ts               # Entry point (starts server)
│   ├── config/
│   │   ├── env.ts              # Env validation (Zod)
│   │   └── constants.ts        # App constants, roles, error codes
│   ├── db/
│   │   ├── index.ts            # Drizzle connection
│   │   ├── schema/             # Database tables (Drizzle schemas)
│   │   ├── migrations/         # SQL migrations (drizzle-kit)
│   │   └── seed.ts             # Seed script
│   ├── modules/                # Feature modules (domain)
│   │   ├── auth/               # Login, logout, refresh, me
│   │   ├── users/              # CRUD users
│   │   └── health/             # Health check
│   ├── plugins/                # Fastify plugins (auth, cors, rate-limit, swagger, request-context)
│   ├── hooks/                  # Pre-handlers (authenticate, authorize)
│   ├── lib/                    # Shared utilities (errors, pagination, hash, logger)
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
- **Repositories** encapsulate Drizzle queries
- **Plugins** handle cross-cutting concerns (auth, CORS, rate limiting, docs)
- **Hooks** are reusable pre-handlers (authenticate, authorize)

## API Endpoints

### Auth (`/auth`)

| Method | Path            | Auth | Description                    |
| ------ | --------------- | ---- | ------------------------------ |
| POST   | `/auth/login`   | No   | Login with email and password  |
| POST   | `/auth/refresh` | No   | Refresh access token (cookie)  |
| POST   | `/auth/logout`  | No   | Revoke refresh token           |
| GET    | `/auth/me`      | Yes  | Get authenticated user profile |

### Users (`/users`)

| Method | Path         | Auth  | Description            |
| ------ | ------------ | ----- | ---------------------- |
| GET    | `/users`     | Yes   | List users (paginated) |
| GET    | `/users/:id` | Yes   | Get user by ID         |
| POST   | `/users`     | Admin | Create user            |
| PATCH  | `/users/:id` | Admin | Update user            |
| DELETE | `/users/:id` | Admin | Delete user            |

### Health (`/health`)

| Method | Path      | Auth | Description  |
| ------ | --------- | ---- | ------------ |
| GET    | `/health` | No   | Health check |

## Authentication Flow

Compatible with the Core Stack frontend auth system:

1. **Login:** `POST /auth/login` returns an `accessToken` in the response body and a `refresh-token` in an httpOnly cookie
2. **Authenticated requests:** Send `Authorization: Bearer <accessToken>` header
3. **Token refresh:** `POST /auth/refresh` reads the cookie and returns a new `accessToken`
4. **Logout:** `POST /auth/logout` revokes the refresh token and clears the cookie

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
   - `<name>.repository.ts` — Database queries
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
