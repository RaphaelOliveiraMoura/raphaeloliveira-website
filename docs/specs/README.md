# Catalogo de Specs

Indice central de todas as funcionalidades do Core Stack, documentadas seguindo a abordagem spec-driven.

> **Template:** Novas specs devem seguir o [template padrao](_TEMPLATE.md).
> **Fluxo:** `rascunho` → `aprovado` → `em-desenvolvimento` → `concluido`

---

## A. Fundacao Visual

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 01 | [Design System](a-fundacao-visual/design-system.md) | Tokens de cores, tipografia, espacamento, tema dark/light, animacoes e motion | 🔴 rascunho |
| 02 | [Componentes & Storybook](a-fundacao-visual/componentes-storybook.md) | Catalogo de ~30 componentes shadcn/ui + setup e organizacao do Storybook | 🔴 rascunho |
| 03 | [Layouts & Responsividade](a-fundacao-visual/layouts-responsividade.md) | Patterns de layout (marketing, dashboard, auth), sidebar, navbar, breakpoints | 🔴 rascunho |
| 04 | [Acessibilidade](a-fundacao-visual/acessibilidade.md) | ARIA, focus management, keyboard nav, reduced-motion, WCAG 2.1 AA | 🔴 rascunho |

## B. Dados & Formularios

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 05 | [Formularios](b-dados-formularios/formularios.md) | react-hook-form + Zod, mascaras de input, multi-step wizards, form patterns | 🔴 rascunho |
| 06 | [Formatadores & Date/Time](b-dados-formularios/formatadores-datetime.md) | Moeda, numeros, documentos BR, strings, datas, timezones, tempo relativo | 🔴 rascunho |
| 07 | [Exibicao & Gestao de Dados](b-dados-formularios/exibicao-gestao-dados.md) | DataTable avancada, listas/grids, export CSV/Excel/PDF, CRUD patterns | 🔴 rascunho |

## C. API & Servidor

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 08 | [Cliente API & Erros](c-api-servidor/cliente-api-erros.md) | HTTP wrapper, interceptors, React Query, error boundaries, retry | 🔴 rascunho |
| 09 | [Servidor & Real-time](c-api-servidor/servidor-realtime.md) | Server Actions, API Routes, Middleware, ISR, WebSocket, SSE | 🔴 rascunho |

## D. Navegacao

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 10 | [Navegacao, URL & Busca](d-navegacao/navegacao-url-busca.md) | URL state, breadcrumbs, command palette, busca global, route guards | 🔴 rascunho |

## E. Infraestrutura

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 11 | [Internacionalizacao](e-infraestrutura/internacionalizacao.md) | next-intl, arquivos de traducao, formatacao locale, pluralizacao | 🔵 em-desenvolvimento |
| 12 | [SEO](e-infraestrutura/seo.md) | Metadata API, Open Graph, JSON-LD, sitemap, robots.txt | 🔴 rascunho |
| 13 | [Autenticacao & Autorizacao](e-infraestrutura/autenticacao-autorizacao.md) | Login/logout, tokens, RBAC, componente Can, usePermissions | 🔴 rascunho |
| 14 | [Seguranca & Configuracao](e-infraestrutura/seguranca-configuracao.md) | XSS, CSRF, CSP, env vars tipadas (t3-env/zod) | 🔴 rascunho |
| 15 | [Logging & Telemetria](e-infraestrutura/logging-telemetria.md) | Logger com niveis, error tracking, analytics, Web Vitals | 🔴 rascunho |

## F. Padroes de UX

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 16 | [Feedback & Orientacao](f-padroes-ux/feedback-orientacao.md) | Notifications, empty/error/loading states, confirmacao, onboarding/tour | 🔴 rascunho |
| 17 | [Interacoes Avancadas](f-padroes-ux/interacoes-avancadas.md) | Clipboard/share, keyboard shortcuts, drag & drop | 🔴 rascunho |

## G. Media & Conteudo

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 18 | [Arquivos & Media](g-media-conteudo/arquivos-media.md) | Upload drag & drop, galeria/lightbox, avatars, video player | 🔴 rascunho |
| 19 | [Conteudo Rico](g-media-conteudo/conteudo-rico.md) | Markdown rendering, syntax highlight, WYSIWYG editor, prose styles | 🔴 rascunho |

## H. Plataforma

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 20 | [Hooks & Utilitarios](h-plataforma/hooks-utilitarios.md) | 13+ custom hooks + wrappers de storage (localStorage, cookies) | 🔴 rascunho |
| 21 | [Performance & PWA](h-plataforma/performance-pwa.md) | Code splitting, bundle analysis, Web Vitals, service worker, offline | 🔴 rascunho |

## I. Experiencia do Desenvolvedor

| # | Spec | Descricao | Status |
|---|------|-----------|--------|
| 22 | [Estrategia de Testes](i-experiencia-desenvolvedor/estrategia-testes.md) | Vitest, Testing Library, Playwright, MSW, factories | 🔴 rascunho |
| 23 | [Pipeline de Entrega](i-experiencia-desenvolvedor/pipeline-entrega.md) | GitHub Actions CI/CD, feature flags, preview deploys | 🔴 rascunho |

---

## Resumo por Status

| Status | Quantidade |
|--------|-----------|
| 🔴 Rascunho | 22 |
| 🟡 Aprovado | 0 |
| 🔵 Em desenvolvimento | 1 |
| 🟢 Concluido | 0 |
| **Total** | **23** |
