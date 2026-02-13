# Core Stack

Template full-stack universal com **Next.js** (frontend) e **Fastify** (backend). Serve como ponto de partida com uma base solida de componentes, utilitarios, API REST, padroes e documentacao para iniciar qualquer novo projeto - de landing pages a paineis administrativos com backend proprio.

## Tech Stack

### Frontend

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

### Backend

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

## Inicio Rapido

> Lista completa de scripts: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) (secao "Scripts Disponiveis").

### Frontend

```bash
npm install         # Instalar dependencias
npm run dev         # Servidor de desenvolvimento
npm run build       # Build de producao
npm run lint        # Linting
npm test            # Testes
npm run storybook   # Storybook (documentacao de componentes)
```

Acesse [http://localhost:3000](http://localhost:3000) para o app e [http://localhost:6006](http://localhost:6006) para o Storybook.

### Backend

```bash
cd backend
docker compose up -d          # Subir PostgreSQL (dev + test)
npm install                   # Instalar dependencias
cp .env.example .env          # Configurar variaveis de ambiente
npm run db:generate           # Gerar migrations
npm run db:migrate            # Aplicar migrations
npm run db:seed               # Seed com dados demo (opcional)
npm run dev                   # Servidor de desenvolvimento
```

Acesse [http://localhost:3001](http://localhost:3001) para a API e [http://localhost:3001/docs](http://localhost:3001/docs) para o Swagger.

> Documentacao detalhada do backend: [`backend/README.md`](backend/README.md).

## Estrutura do Projeto

> Fonte canonica da estrutura de pastas do frontend: [`.cursor/rules/general.mdc`](.cursor/rules/general.mdc). Para agentes de IA: [`AGENTS.md`](AGENTS.md).

```
core-stack/
├── .cursor/rules/          # Regras para agentes de IA
├── .github/workflows/      # CI/CD (GitHub Actions)
├── .storybook/             # Configuracao do Storybook
├── backend/                # API REST (Fastify + Drizzle + PostgreSQL)
│   ├── src/
│   │   ├── modules/        # Modulos de dominio (auth, users, health)
│   │   ├── plugins/        # Plugins Fastify (auth, cors, rate-limit, swagger)
│   │   ├── hooks/          # Pre-handlers (authenticate, authorize)
│   │   ├── db/             # Drizzle schemas, migrations, seed
│   │   ├── config/         # Env vars (Zod), constantes
│   │   └── lib/            # Utilitarios (errors, hash, logger, pagination)
│   ├── tests/              # Testes Vitest do backend
│   └── docker-compose.yml  # PostgreSQL para dev e testes
├── docs/                   # ARCHITECTURE.md, CONTRIBUTING.md, specs/
├── src/                    # Codigo-fonte frontend (ver general.mdc para arvore detalhada)
├── tests/                  # Setup, factories e mocks para testes frontend
└── public/                 # Assets estaticos
```

## Catalogo de Funcionalidades

O projeto segue **Spec-Driven Development**: cada funcionalidade e documentada em uma spec antes de ser implementada. As specs ficam em [`docs/specs/`](docs/specs/README.md).

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md) - Decisoes arquiteturais e padroes (frontend + backend)
- [Contribuicao](docs/CONTRIBUTING.md) - Como contribuir e fluxo de desenvolvimento
- [Catalogo de Specs](docs/specs/README.md) - Indice detalhado de todas as specs
- [Backend](backend/README.md) - Documentacao detalhada da API (endpoints, auth, modulos, logging)

## Abordagem Spec-Driven

Toda funcionalidade segue um fluxo estruturado: spec → aprovacao → implementacao → validacao. As specs servem como documentacao viva e como guia para agentes de IA.

> Fluxo completo: [`.cursor/rules/specs.mdc`](.cursor/rules/specs.mdc). Template: [`docs/specs/_TEMPLATE.md`](docs/specs/_TEMPLATE.md). Guia de contribuicao: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## Licenca

Projeto privado - uso interno.
