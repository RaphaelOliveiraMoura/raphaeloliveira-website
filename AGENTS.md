# AGENTS.md

> Contexto para agentes de IA que trabalham neste projeto.
> Este arquivo e um **indice de navegacao** — o conteudo detalhado esta nas fontes referenciadas.
> Principio: **fonte unica de verdade** — cada informacao existe em exatamente um lugar canonico (ver [documentation.mdc](.cursor/rules/documentation.mdc)).

## Identidade

Core Stack e um template base universal para projetos Next.js 16 (App Router) com React 19, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui e React Compiler.

- **Idioma:** codigo em ingles, documentacao em portugues (BR).
- **Abordagem:** Spec-Driven Development — toda feature e documentada antes de implementada.

## Navegacao por Contexto

Consulte a fonte adequada ao seu contexto de trabalho:

### Convencoes e Regras (`.cursor/rules/`)

> Mapa completo de autoridade (qual documento e canonico para cada assunto): [documentation.mdc](.cursor/rules/documentation.mdc).

| Contexto de trabalho                                                      | Fonte canonica                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Convencoes gerais (naming, imports, TS, exports, logging, estrutura)      | [general.mdc](.cursor/rules/general.mdc)               |
| Internacionalizacao (imports centralizados, textos, navegacao, rich text) | [i18n.mdc](.cursor/rules/i18n.mdc)                     |
| Componentes React (estrutura, RSC vs client, a11y, styling)               | [components.mdc](.cursor/rules/components.mdc)         |
| Hooks (catalogo, quando usar, como criar)                                 | [hooks.mdc](.cursor/rules/hooks.mdc)                   |
| Error handling (ErrorState, boundaries, normalizeApiError)                | [error-handling.mdc](.cursor/rules/error-handling.mdc) |
| Lint e React Compiler (regras, footguns, pre-commit)                      | [linting.mdc](.cursor/rules/linting.mdc)               |
| Testes (Vitest, Testing Library, Playwright, MSW)                         | [testing.mdc](.cursor/rules/testing.mdc)               |
| Specs e fluxo spec-driven                                                 | [specs.mdc](.cursor/rules/specs.mdc)                   |
| Governanca de documentacao (fonte unica de verdade, autoridade)           | [documentation.mdc](.cursor/rules/documentation.mdc)   |
| AI Skills (instalacao, criacao, manutencao)                               | [skills.mdc](.cursor/rules/skills.mdc)                 |

### Documentacao (`docs/`)

| Assunto                                                      | Fonte                                          |
| ------------------------------------------------------------ | ---------------------------------------------- |
| Decisoes arquiteturais — o "por que" de cada escolha         | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   |
| Guia de contribuicao — fluxo, commits, scripts, git hooks    | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)   |
| Catalogo de specs — 25 features com referencia rapida da API | [docs/specs/README.md](docs/specs/README.md)   |
| Referencias UI/UX externas — libs, ferramentas e tendencias  | [docs/UI-REFERENCES.md](docs/UI-REFERENCES.md) |

### Estrutura do Projeto

Arvore completa: [README.md - Estrutura do Projeto](README.md#estrutura-do-projeto).

Diretorios-chave em `src/`:

- `app/` — Pages e rotas (App Router, i18n via `[locale]`)
- `components/` — `ui/` (shadcn), `shared/` (compostos reutilizaveis), `layouts/` (sidebar, navbar)
- `lib/` — Logica de negocio: api, auth, datetime, formatters, i18n, masks, search, security, seo, storage, telemetry, validation, utils
- `hooks/` — 25+ custom hooks (importar via barrel `@/hooks`)
- `providers/` — Context providers (auth, query, theme, motion)
- `config/` — Env vars tipadas, constantes, feature flags

### AI Skills (`.cursor/skills/`)

Skills fornecem conhecimento de bibliotecas externas (API reference, breaking changes, migration guides). Indice completo com versoes e comandos de instalacao: [skills.mdc](.cursor/rules/skills.mdc).
