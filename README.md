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

### Status

- 🔴 `rascunho` - Spec criada, aguardando refinamento
- 🟡 `aprovado` - Spec revisada, pronta para implementacao
- 🔵 `em-desenvolvimento` - Implementacao em andamento
- 🟢 `concluido` - Implementado e validado

### A. Fundacao Visual

| # | Funcionalidade | Status |
|---|---------------|--------|
| 01 | [Design System](docs/specs/a-fundacao-visual/design-system.md) - tokens, tema dark/light, animacoes | 🔴 rascunho |
| 02 | [Componentes & Storybook](docs/specs/a-fundacao-visual/componentes-storybook.md) - catalogo shadcn/ui + docs | 🔴 rascunho |
| 03 | [Layouts & Responsividade](docs/specs/a-fundacao-visual/layouts-responsividade.md) - layouts, sidebar, breakpoints | 🔴 rascunho |
| 04 | [Acessibilidade](docs/specs/a-fundacao-visual/acessibilidade.md) - ARIA, focus, keyboard, WCAG AA | 🔴 rascunho |

### B. Dados & Formularios

| # | Funcionalidade | Status |
|---|---------------|--------|
| 05 | [Formularios](docs/specs/b-dados-formularios/formularios.md) - validacao, mascaras, multi-step | 🔴 rascunho |
| 06 | [Formatadores & Date/Time](docs/specs/b-dados-formularios/formatadores-datetime.md) - moeda, docs BR, datas | 🔴 rascunho |
| 07 | [Exibicao & Gestao de Dados](docs/specs/b-dados-formularios/exibicao-gestao-dados.md) - DataTable, listas, CRUD | 🔴 rascunho |

### C. API & Servidor

| # | Funcionalidade | Status |
|---|---------------|--------|
| 08 | [Cliente API & Erros](docs/specs/c-api-servidor/cliente-api-erros.md) - HTTP wrapper, React Query, errors | 🔴 rascunho |
| 09 | [Servidor & Real-time](docs/specs/c-api-servidor/servidor-realtime.md) - Server Actions, WebSocket, SSE | 🔴 rascunho |

### D. Navegacao

| # | Funcionalidade | Status |
|---|---------------|--------|
| 10 | [Navegacao, URL & Busca](docs/specs/d-navegacao/navegacao-url-busca.md) - URL state, search, breadcrumbs | 🔴 rascunho |

### E. Infraestrutura

| # | Funcionalidade | Status |
|---|---------------|--------|
| 11 | [Internacionalizacao](docs/specs/e-infraestrutura/internacionalizacao.md) - traducoes, formatacao locale | 🔴 rascunho |
| 12 | [SEO](docs/specs/e-infraestrutura/seo.md) - meta tags, OG, JSON-LD, sitemap | 🔴 rascunho |
| 13 | [Autenticacao & Autorizacao](docs/specs/e-infraestrutura/autenticacao-autorizacao.md) - auth flow, RBAC, UI condicional | 🔴 rascunho |
| 14 | [Seguranca & Configuracao](docs/specs/e-infraestrutura/seguranca-configuracao.md) - XSS/CSRF/CSP, env vars | 🔴 rascunho |
| 15 | [Logging & Telemetria](docs/specs/e-infraestrutura/logging-telemetria.md) - logger, analytics, Web Vitals | 🔴 rascunho |

### F. Padroes de UX

| # | Funcionalidade | Status |
|---|---------------|--------|
| 16 | [Feedback & Orientacao](docs/specs/f-padroes-ux/feedback-orientacao.md) - notifications, states, onboarding | 🔴 rascunho |
| 17 | [Interacoes Avancadas](docs/specs/f-padroes-ux/interacoes-avancadas.md) - clipboard, shortcuts, DnD | 🔴 rascunho |

### G. Media & Conteudo

| # | Funcionalidade | Status |
|---|---------------|--------|
| 18 | [Arquivos & Media](docs/specs/g-media-conteudo/arquivos-media.md) - upload, galeria, avatars, video | 🔴 rascunho |
| 19 | [Conteudo Rico](docs/specs/g-media-conteudo/conteudo-rico.md) - markdown, syntax highlight, WYSIWYG | 🔴 rascunho |

### H. Plataforma

| # | Funcionalidade | Status |
|---|---------------|--------|
| 20 | [Hooks & Utilitarios](docs/specs/h-plataforma/hooks-utilitarios.md) - 13+ hooks + storage wrappers | 🔴 rascunho |
| 21 | [Performance & PWA](docs/specs/h-plataforma/performance-pwa.md) - otimizacao, service worker | 🔴 rascunho |

### I. Experiencia do Desenvolvedor

| # | Funcionalidade | Status |
|---|---------------|--------|
| 22 | [Estrategia de Testes](docs/specs/i-experiencia-desenvolvedor/estrategia-testes.md) - Vitest, Playwright, MSW | 🔴 rascunho |
| 23 | [Pipeline de Entrega](docs/specs/i-experiencia-desenvolvedor/pipeline-entrega.md) - CI/CD, feature flags | 🔴 rascunho |

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
