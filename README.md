# Core Stack

Template base universal para projetos Next.js. Serve como ponto de partida com uma base solida de componentes, utilitarios, padroes e documentacao para iniciar qualquer novo projeto - de landing pages a paineis administrativos.

## Tech Stack

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| [Next.js](https://nextjs.org/) | 16 | Framework React com App Router |
| [React](https://react.dev/) | 19 | Biblioteca UI com React Compiler |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Tipagem estatica |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilizacao utility-first |
| [shadcn/ui](https://ui.shadcn.com/) | - | Componentes acessiveis (Radix UI) |
| [Storybook](https://storybook.js.org/) | - | Documentacao visual de componentes |
| [Vitest](https://vitest.dev/) | 4 | Testes unitarios e de integracao |
| [Playwright](https://playwright.dev/) | - | Testes end-to-end |

## Inicio Rapido

```bash
# Instalar dependencias
npm install

# Servidor de desenvolvimento
npm run dev

# Build de producao
npm run build

# Linting
npm run lint

# Testes
npm test

# Storybook (documentacao de componentes)
npm run storybook
```

Acesse [http://localhost:3000](http://localhost:3000) para o app e [http://localhost:6006](http://localhost:6006) para o Storybook.

## Estrutura do Projeto

```
core-stack/
├── .cursor/rules/          # Regras para agentes de IA
├── .github/workflows/      # CI/CD (GitHub Actions)
├── .storybook/             # Configuracao do Storybook
├── docs/
│   ├── ARCHITECTURE.md     # Decisoes arquiteturais
│   ├── CONTRIBUTING.md     # Guia de contribuicao
│   └── specs/              # Specs de funcionalidades (spec-driven dev)
├── src/
│   ├── app/                # Pages e rotas (Next.js App Router)
│   ├── components/
│   │   ├── ui/             # Componentes shadcn/ui
│   │   ├── shared/         # Componentes compostos reutilizaveis
│   │   └── layouts/        # Layouts (sidebar, navbar, page wrappers)
│   ├── lib/                # Logica de negocio e utilitarios
│   │   ├── api/            # HTTP client, interceptors, React Query
│   │   ├── auth/           # Autenticacao, tokens, guards
│   │   ├── datetime/       # Manipulacao de datas e timezones
│   │   ├── feature-flags/  # Feature toggles
│   │   ├── formatters/     # Formatadores (moeda, documentos, strings)
│   │   ├── i18n/           # Internacionalizacao
│   │   ├── masks/          # Mascaras de input
│   │   ├── search/         # Busca global
│   │   ├── security/       # Sanitizacao, CSRF
│   │   ├── seo/            # Utilitarios SEO
│   │   ├── storage/        # localStorage, sessionStorage, cookies
│   │   ├── telemetry/      # Logs, analytics, error tracking
│   │   ├── validation/     # Schemas Zod
│   │   └── utils/          # Utilitarios gerais
│   ├── hooks/              # Custom React hooks
│   ├── providers/          # Context providers
│   ├── styles/             # Estilos globais, tokens CSS
│   ├── types/              # Tipos TypeScript globais
│   └── config/             # Environment vars, constantes
├── tests/                  # Setup, factories e mocks para testes
└── public/                 # Assets estaticos
```

## Catalogo de Funcionalidades

O projeto segue **Spec-Driven Development**: cada funcionalidade e documentada em uma spec antes de ser implementada. As specs ficam em [`docs/specs/`](docs/specs/README.md).

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md) - Decisoes arquiteturais e padroes
- [Contribuicao](docs/CONTRIBUTING.md) - Como contribuir e fluxo de desenvolvimento
- [Catalogo de Specs](docs/specs/README.md) - Indice detalhado de todas as specs

## Abordagem Spec-Driven

Toda funcionalidade segue um fluxo estruturado:

1. **Spec** - Documentar requisitos, API e criterios de aceite
2. **Aprovacao** - Revisar e refinar a spec
3. **Implementacao** - Desenvolver seguindo a spec
4. **Validacao** - Verificar criterios de aceite

As specs servem como documentacao viva e como guia para agentes de IA que trabalham no projeto. Veja o [template de spec](docs/specs/_TEMPLATE.md) e o [guia de contribuicao](docs/CONTRIBUTING.md) para mais detalhes.

## Licenca

Projeto privado - uso interno.
