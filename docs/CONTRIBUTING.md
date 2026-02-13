# Guia de Contribuicao

Como contribuir para o Core Stack seguindo o fluxo spec-driven.

> **Nota:** Este guia e voltado para desenvolvedores humanos. Agentes de IA devem seguir as diretivas em `.cursor/rules/` (especialmente `specs.mdc` para o fluxo spec-driven).

## Fluxo de Desenvolvimento

```
1. Spec (documentar)
   └── 2. Aprovacao (revisar)
       └── 3. Branch (criar)
           └── 4. Implementacao (codar)
               └── 5. Testes (validar)
                   └── 6. PR (revisar)
                       └── 7. Merge (entregar)
```

## 1. Criando uma Nova Spec

Antes de implementar qualquer funcionalidade, crie uma spec usando o [template padrao](specs/_TEMPLATE.md) e adicione-a ao [indice](specs/README.md). Fluxo completo e checklist: `.cursor/rules/specs.mdc` (fonte canonica).

## 2. Implementando uma Feature

1. Leia a spec completa em `docs/specs/`
2. Atualize o status da spec para `em-desenvolvimento`
3. Crie uma branch: `git checkout -b feat/nome-da-feature`

> Estrutura de pastas: `.cursor/rules/general.mdc`. Decisoes arquiteturais: [ARCHITECTURE.md](ARCHITECTURE.md).

### Checklist de Implementacao

- [ ] Codigo segue as convencoes de nomenclatura (ver `.cursor/rules/general.mdc`)
- [ ] TypeScript strict (sem `any`, tipos completos)
- [ ] Componentes acessiveis (ARIA, keyboard nav)
- [ ] Testes escritos (unit e/ou component)
- [ ] Storybook stories criadas (se for componente)
- [ ] Barrel file (`index.ts`) atualizado
- [ ] Criterios de aceite da spec verificados

## 3. Adicionando Componentes shadcn/ui

> Regras completas de componentes (estrutura, shadcn, a11y, composicao): `.cursor/rules/components.mdc`.

```bash
npx shadcn@latest add <component>
```

Os componentes sao instalados em `src/components/ui/`. Customize conforme necessario - sao seus, nao sao dependencias externas.

## 4. Criando Custom Hooks

> Catalogo completo de hooks, quando usar cada um, e regras de criacao: `.cursor/rules/hooks.mdc`.

Resumo: criar em `src/hooks/use-nome.ts`, export nomeado, adicionar no barrel `src/hooks/index.ts`.

## 5. Conventional Commits

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
docs(specs): update forms spec with multi-step requirements
test(hooks): add tests for useDebounce hook
chore(ci): add GitHub Actions workflow for lint and tests
feat(backend): add users CRUD module
fix(backend): handle duplicate email on user creation
feat(db): add refresh-tokens table schema
test(backend): add integration tests for auth module
```

## 6. Pull Requests

### Formato do PR

**Titulo:** Seguir conventional commits (`feat(ui): add Button component`)

**Corpo:**

```markdown
## Resumo

Breve descricao do que foi feito e por que.

## Spec

Link para a spec: `docs/specs/<pasta>/<arquivo>.md`

## Mudancas

- Mudanca 1
- Mudanca 2

## Checklist

- [ ] Testes passando
- [ ] Lint passando
- [ ] Spec atualizada (status)
- [ ] Storybook atualizado (se aplicavel)
```

## 7. Scripts Disponiveis

### Frontend

#### Desenvolvimento

```bash
npm run dev            # Servidor de desenvolvimento (Next.js, porta 3000)
npm run storybook      # Storybook dev server (porta 6006)
```

#### Build

```bash
npm run build          # Build de producao (Next.js)
npm run build-storybook # Build estatico do Storybook
npm start              # Servidor de producao (apos build)
```

#### Qualidade de Codigo

```bash
npm run lint           # ESLint
npm run lint:fix       # ESLint com auto-fix
npm run lint:ci        # ESLint strict (zero warnings, para CI)
npm run typecheck      # TypeScript type-check (tsc --noEmit)
npm run format         # Prettier (formata todos os arquivos)
npm run format:check   # Prettier (verifica sem alterar, para CI)
```

#### Testes

```bash
npm test               # Vitest (execucao unica)
npm run test:debug     # Vitest em modo watch (desenvolvimento)
npm run test:coverage  # Vitest com cobertura (v8)
npm run test:e2e       # Playwright (end-to-end)
npm run test:e2e:ui    # Playwright com UI interativa
```

### Backend

> Todos os comandos abaixo devem ser executados dentro do diretorio `backend/`.

#### Infraestrutura

```bash
docker compose up -d          # Subir PostgreSQL (dev na porta 5432 + test na porta 5433)
docker compose down           # Parar containers
```

#### Desenvolvimento

```bash
npm run dev                   # Servidor de desenvolvimento com hot reload (tsx watch, porta 3001)
npm start                     # Servidor de producao (apos build)
```

#### Build

```bash
npm run build                 # Build para producao (tsup, ESM)
```

#### Banco de Dados

```bash
npm run db:generate           # Gerar migrations SQL (Drizzle Kit)
npm run db:migrate            # Aplicar migrations pendentes
npm run db:push               # Push schema direto (sem migration, util para dev)
npm run db:studio             # Abrir Drizzle Studio (editor visual do banco)
npm run db:seed               # Popular banco com dados demo (admin + user)
```

#### Testes

```bash
npm test                      # Vitest (execucao unica, usa banco postgres-test na porta 5433)
npm run test:coverage         # Vitest com cobertura (thresholds: 70% statements, 60% branches)
```

#### Qualidade de Codigo

```bash
npm run typecheck             # TypeScript type-check (tsc --noEmit)
```

> **Nota:** Lint e formatacao do backend sao gerenciados pela raiz do projeto (`npm run lint` e `npm run format` na raiz).

## 8. Git Hooks (Husky)

O projeto usa [Husky](https://typicode.github.io/husky/) para automatizar verificacoes antes de commits e pushes. Os hooks sao instalados automaticamente via `npm install` (script `prepare`).

### pre-commit

Executado a cada commit. Roda lint e type-check apenas nos arquivos staged:

```bash
npm run lint:staged    # lint-staged (ESLint + Prettier nos arquivos alterados)
npm run typecheck      # TypeScript type-check completo (frontend)
```

### pre-push

Executado antes de cada push. Roda a suite completa de verificacoes:

```bash
npm run lint           # ESLint (todos os arquivos)
npm run typecheck      # TypeScript type-check (frontend)
npm run test           # Vitest (testes frontend)
npm run build          # Build de producao (garante que compila)
```

> **Backend:** Os hooks `pre-commit` e `pre-push` do backend (`npm run typecheck` e `npm test` no diretorio `backend/`) sao acionados via scripts proprios. Verificacoes do backend tambem rodam na CI.

### commit-msg

Valida a mensagem de commit usando [commitlint](https://commitlint.js.org/) com a convencao Conventional Commits (ver secao 5).

## 9. CI/CD

O pipeline de CI (GitHub Actions) roda automaticamente em push para `main` e em pull requests:

| Step                 | Escopo   | Descricao                                       |
| -------------------- | -------- | ----------------------------------------------- |
| Install dependencies | Ambos    | `npm ci` na raiz e em `backend/`                |
| Lint                 | Frontend | ESLint strict (`lint:ci`)                       |
| Typecheck (frontend) | Frontend | `tsc --noEmit`                                  |
| Typecheck (backend)  | Backend  | `tsc --noEmit` no diretorio `backend/`          |
| Tests (frontend)     | Frontend | Vitest                                          |
| Tests (backend)      | Backend  | Vitest com PostgreSQL (service container, 5433) |

O CI utiliza um service container `postgres:17-alpine` na porta 5433 para rodar os testes do backend com banco real.
