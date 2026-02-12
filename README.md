# Core Stack

Template base universal para projetos Next.js. Serve como ponto de partida com uma base solida de componentes, utilitarios, padroes e documentacao para iniciar qualquer novo projeto - de landing pages a paineis administrativos.

## Tech Stack

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

## Inicio Rapido

> Lista completa de scripts: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) (secao "Scripts Disponiveis").

```bash
npm install         # Instalar dependencias
npm run dev         # Servidor de desenvolvimento
npm run build       # Build de producao
npm run lint        # Linting
npm test            # Testes
npm run storybook   # Storybook (documentacao de componentes)
```

Acesse [http://localhost:3000](http://localhost:3000) para o app e [http://localhost:6006](http://localhost:6006) para o Storybook.

## Estrutura do Projeto

> Fonte canonica da estrutura de pastas: [`.cursor/rules/general.mdc`](.cursor/rules/general.mdc). Para agentes de IA: [`AGENTS.md`](AGENTS.md).

```
core-stack/
├── .cursor/rules/          # Regras para agentes de IA
├── .github/workflows/      # CI/CD (GitHub Actions)
├── .storybook/             # Configuracao do Storybook
├── docs/                   # ARCHITECTURE.md, CONTRIBUTING.md, specs/
├── src/                    # Codigo-fonte (ver general.mdc para arvore detalhada)
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

Toda funcionalidade segue um fluxo estruturado: spec → aprovacao → implementacao → validacao. As specs servem como documentacao viva e como guia para agentes de IA.

> Fluxo completo: [`.cursor/rules/specs.mdc`](.cursor/rules/specs.mdc). Template: [`docs/specs/_TEMPLATE.md`](docs/specs/_TEMPLATE.md). Guia de contribuicao: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## Licenca

Projeto privado - uso interno.
