# Guia de Contribuicao

## Conventional Commits

Formato: `<tipo>(<escopo>): <descricao>`

### Tipos

| Tipo       | Uso                                |
| ---------- | ---------------------------------- |
| `feat`     | Nova funcionalidade                |
| `fix`      | Correcao de bug                    |
| `docs`     | Documentacao                       |
| `style`    | Formatacao (sem mudanca de logica) |
| `refactor` | Refatoracao de codigo              |
| `test`     | Adicao/correcao de testes          |
| `chore`    | Manutencao (deps, configs)         |

### Escopos (opcionais)

`ui`, `api`, `auth`, `forms`, `i18n`, `seo`, `telemetry`, `hooks`, `config`, `ci`, `backend`, `db`

### Exemplos

```
feat(ui): add Button component with variants
fix(api): handle token refresh race condition
test(hooks): add tests for useDebounce hook
chore(ci): add GitHub Actions workflow for lint and tests
feat(backend): add users CRUD module
fix(backend): handle duplicate email on user creation
feat(db): add refresh-tokens table schema
test(backend): add integration tests for auth module
```

## Scripts

### Frontend

```bash
# Desenvolvimento
npm run dev              # Next.js dev server (porta 3000)
npm run storybook        # Storybook dev server (porta 6006)

# Build
npm run build            # Build de producao
npm run build-storybook  # Build estatico do Storybook

# Qualidade
npm run lint             # ESLint
npm run lint:fix         # ESLint com auto-fix
npm run typecheck        # TypeScript type-check
npm run format           # Prettier

# Testes
npm test                 # Vitest (execucao unica)
npm run test:debug       # Vitest em modo watch
npm run test:coverage    # Vitest com cobertura
npm run test:e2e         # Playwright (e2e)
```

### Backend

> Executar dentro do diretorio `backend/`.

```bash
# Infraestrutura
docker compose up -d     # PostgreSQL (dev:5432 + test:5433)

# Desenvolvimento
npm run dev              # Hot reload (tsx watch, porta 3001)
npm run build            # Build producao (tsup, ESM)

# Banco de Dados
npm run db:generate      # Gerar migrations SQL
npm run db:migrate       # Aplicar migrations
npm run db:push          # Push schema direto (dev)
npm run db:studio        # Drizzle Studio
npm run db:seed          # Popular com dados demo

# Testes
npm test                 # Vitest (banco postgres-test:5433)
npm run test:coverage    # Vitest com cobertura
npm run typecheck        # TypeScript type-check
```

## Git Hooks (Husky)

- **pre-commit:** `lint-staged` (ESLint + Prettier nos arquivos staged) + `typecheck`
- **pre-push:** `lint` + `typecheck` + `test` + `build` (suite completa)
- **commit-msg:** Valida conventional commits via commitlint

## CI/CD (GitHub Actions)

Roda em push para `main` e em PRs:

| Step                 | Escopo   | Descricao                                       |
| -------------------- | -------- | ----------------------------------------------- |
| Install dependencies | Ambos    | `npm ci` na raiz e em `backend/`                |
| Lint                 | Frontend | ESLint strict (`lint:ci`)                       |
| Typecheck (frontend) | Frontend | `tsc --noEmit`                                  |
| Typecheck (backend)  | Backend  | `tsc --noEmit` no diretorio `backend/`          |
| Tests (frontend)     | Frontend | Vitest                                          |
| Tests (backend)      | Backend  | Vitest com PostgreSQL (service container, 5433) |
