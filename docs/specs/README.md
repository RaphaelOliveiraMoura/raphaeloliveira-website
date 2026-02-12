# Catalogo de Specs

Indice central de todas as funcionalidades do Core Stack, documentadas seguindo a abordagem spec-driven.

> **Template:** Novas specs devem seguir o [template padrao](_TEMPLATE.md).
> **Fluxo:** `rascunho` → `aprovado` → `em-desenvolvimento` → `concluido`

---

## A. Fundacao Visual

| #   | Spec                                                                            | Status       |
| --- | ------------------------------------------------------------------------------- | ------------ |
| 01  | [Design System](a-fundacao-visual/design-system.md)                             | 🟢 concluido |
| 02  | [Componentes & Storybook](a-fundacao-visual/componentes-storybook.md)           | 🟢 concluido |
| 03  | [Layouts & Responsividade](a-fundacao-visual/layouts-responsividade.md)         | 🟢 concluido |
| 04  | [Acessibilidade](a-fundacao-visual/acessibilidade.md)                           | 🟢 concluido |
| 25  | [Animacoes & Micro-Interacoes](a-fundacao-visual/animacoes-micro-interacoes.md) | 🟢 concluido |

**01 — Design System:** CSS variables + Tailwind v4 `@theme` (cores, tipografia Geist, espacamento, radius, sombras), tema dark/light via `ThemeProvider`, tokens de animacao (`duration-fast`, `ease-in-out`), `PageTransition`, `useReducedMotion`.

**02 — Componentes & Storybook:** ~30 componentes shadcn/ui (`@/components/ui/*`) organizados por categoria (Basic, Form, Feedback, Overlay, Navigation, Data, Layout). Storybook 10 com stories em `stories/`.

**03 — Layouts & Responsividade:** Layouts Marketing, Dashboard e Auth. Sidebar colapsavel/drawer mobile (`@/components/layouts/dashboard-sidebar`), navbar, footer. Hooks: `useMediaQuery`, `useBreakpoint`, `useIsMobile`, `useIsDesktop`.

**04 — Acessibilidade:** WCAG 2.1 AA: `SkipLink`, `LiveRegion`, focus trap em modais, ARIA patterns, `meetsContrastRatio` (`@/lib/utils/contrast`).

**25 — Animacoes & Micro-Interacoes:** Primitivos Framer Motion (`@/lib/motion`): `FadeIn`, `SlideIn`, `StaggerChildren`, `AnimateOnScroll`, `CountUp`, `TypeWriter`. `ScrollProgress`, `BackToTop`, `MotionProvider`. Keyframes CSS: `shimmer`, `shake`, `wiggle`, `gradient-shift`, `marquee`, `border-beam`. Componentes visuais de marketing (`@/components/shared`): `DotPattern`, `AnimatedGradientText`, `BorderBeam`, `Marquee`, `BentoGrid`/`BentoCard`.

## B. Dados & Formularios

| #   | Spec                                                                       | Status       |
| --- | -------------------------------------------------------------------------- | ------------ |
| 05  | [Formularios](b-dados-formularios/formularios.md)                          | 🟢 concluido |
| 06  | [Formatadores & Date/Time](b-dados-formularios/formatadores-datetime.md)   | 🟢 concluido |
| 07  | [Exibicao & Gestao de Dados](b-dados-formularios/exibicao-gestao-dados.md) | 🟢 concluido |

**05 — Formularios:** react-hook-form + Zod. `Form`, `FormWizard`, `MaskedInput` (`@/components/shared`). Schemas compartilhados (`@/lib/validation/schemas/shared`). Mascaras: CPF, CNPJ, CEP, telefone, moeda (`@/lib/masks`).

**06 — Formatadores & Date/Time:** `@/lib/formatters`: `formatCurrency`, `abbreviateNumber`, `formatCpf`, `formatCnpj`, `formatCep`, `truncate`, `capitalize`, `slugify`, `pluralize`. `@/lib/datetime`: `formatDate`, `formatRelativeTime`, `formatDateRange`, `formatInUserTimezone`.

**07 — Exibicao & Gestao de Dados:** `DataTable`, `VirtualizedDataTable`, `TableFilters`, `BulkActionBar`, `EditableCell`, `InfiniteList`, `EmptyState`, `GridListViewToggle` (`@/components/shared`). Export CSV/Excel/JSON/PDF (`@/lib/data/export`). Padroes CRUD.

## C. API & Servidor

| #   | Spec                                                        | Status       |
| --- | ----------------------------------------------------------- | ------------ |
| 08  | [Cliente API & Erros](c-api-servidor/cliente-api-erros.md)  | 🟢 concluido |
| 09  | [Servidor & Real-time](c-api-servidor/servidor-realtime.md) | 🟢 concluido |

**08 — Cliente API & Erros:** `createApiClient`, `apiClient` (`@/lib/api/client`), `ApiError`, `normalizeApiError` (`@/lib/api/errors`). `QueryProvider` (`@/providers/query-provider`). `ErrorBoundary`, `ErrorState`, `LoadingFallback` (`@/components/shared`).

**09 — Servidor & Real-time:** Server Actions com Zod, API Routes, middleware, ISR. `useWebSocket`, `useSSE`, `usePolling` (`@/lib/realtime`).

## D. Navegacao

| #   | Spec                                                         | Status       |
| --- | ------------------------------------------------------------ | ------------ |
| 10  | [Navegacao, URL & Busca](d-navegacao/navegacao-url-busca.md) | 🟢 concluido |

**10 — Navegacao, URL & Busca:** `useUrlState`, `useUrlStateMulti`, `useUrlPagination` (`@/hooks`). `Breadcrumbs`, `CommandPalette` (`@/components/navigation`). `GlobalSearch`, `HighlightMatch`, `SearchResultItem` (`@/components/search`). `useSearchResults`, `useRecentSearches`.

## E. Infraestrutura

| #   | Spec                                                                       | Status       |
| --- | -------------------------------------------------------------------------- | ------------ |
| 11  | [Internacionalizacao](e-infraestrutura/internacionalizacao.md)             | 🟢 concluido |
| 12  | [SEO](e-infraestrutura/seo.md)                                             | 🟢 concluido |
| 13  | [Autenticacao & Autorizacao](e-infraestrutura/autenticacao-autorizacao.md) | 🟢 concluido |
| 14  | [Seguranca & Configuracao](e-infraestrutura/seguranca-configuracao.md)     | 🟢 concluido |
| 15  | [Logging & Telemetria](e-infraestrutura/logging-telemetria.md)             | 🟢 concluido |

**11 — Internacionalizacao:** next-intl com App Router. `Link`, `useRouter`, `usePathname`, `useTranslations`, `useLocale`, `useDateFormatter`, `useNumberFormatter` (`@/lib/i18n`). `LanguageSwitcher` (`@/components/shared`). Locales: pt-BR, en, es.

**12 — SEO:** `generateMetadataBase` (`@/lib/seo/metadata`). JSON-LD: `buildOrganizationJsonLd`, `buildProductJsonLd`, `buildArticleJsonLd`, `buildBreadcrumbJsonLd` (`@/lib/seo/json-ld`). `JsonLd` component. `sitemap.ts`, `robots.ts`.

**13 — Autenticacao & Autorizacao:** `useAuth`, `usePermissions` (`@/hooks`). `Can`, `PermissionButton`, `RequirePermission` (`@/components/auth`). `AuthProvider` (`@/providers`). RBAC, `getSession` (`@/lib/auth/session`). Middleware de protecao.

**14 — Seguranca & Configuracao:** `env` tipado via t3-env/zod (`@/config/env`). `sanitizeHtml` (`@/lib/security/sanitize`). `getSecurityHeaders`, `generateCsrfToken`, `validateCsrfToken`, `createClientRateLimiter` (`@/lib/security`). `useThrottle`.

**15 — Logging & Telemetria:** `logger` com niveis debug/info/warn/error (`@/lib/telemetry/logger`). `track` analytics (`@/lib/telemetry/analytics`). `reportWebVitals` (`@/lib/telemetry/web-vitals`). `WebVitalsReporter`, `PageViewTracker` (`@/components/telemetry`). `useTrackEvent`.

## F. Padroes de UX

| #   | Spec                                                         | Status       |
| --- | ------------------------------------------------------------ | ------------ |
| 16  | [Feedback & Orientacao](f-padroes-ux/feedback-orientacao.md) | 🟢 concluido |
| 17  | [Interacoes Avancadas](f-padroes-ux/interacoes-avancadas.md) | 🟢 concluido |

**16 — Feedback & Orientacao:** `toast` (success, error, warning, info, promise) (`@/lib/feedback/toast`). `EmptyState`, `ErrorState`, `SkeletonPresets`, `ConfirmDialog`, `LoadingButton`, `NotificationCenter`, `Tour`, `OfflineBanner` (`@/components/shared`). `useNotifications`, `useOnlineStatus`.

**17 — Interacoes Avancadas:** `useClipboard`, `useShare`, `useKeyboardShortcut` (`@/hooks`). `ShortcutProvider`, `CheatSheet`. `SortableList`, `KanbanBoard` (`@/components/shared`) via @dnd-kit.

## G. Media & Conteudo

| #   | Spec                                                   | Status       |
| --- | ------------------------------------------------------ | ------------ |
| 18  | [Arquivos & Media](g-media-conteudo/arquivos-media.md) | 🟢 concluido |
| 19  | [Conteudo Rico](g-media-conteudo/conteudo-rico.md)     | 🟢 concluido |

**18 — Arquivos & Media:** `FileUpload`, `ImageCropUpload`, `Lightbox`, `Avatar`, `ResponsiveImage`, `VideoPlayer` (`@/components/shared`). `downloadWithProgress` (`@/lib/media`).

**19 — Conteudo Rico:** `MarkdownContent`, `CodeBlock`, `RichTextEditor`, `ResponsiveEmbed`, `TableOfContents` (`@/components/content`). Sanitizacao via `@/lib/security/sanitize`. Prose styles em `prose.css`.

## H. Plataforma

| #   | Spec                                                     | Status       |
| --- | -------------------------------------------------------- | ------------ |
| 20  | [Hooks & Utilitarios](h-plataforma/hooks-utilitarios.md) | 🟢 concluido |
| 21  | [Performance & PWA](h-plataforma/performance-pwa.md)     | 🟢 concluido |

**20 — Hooks & Utilitarios:** 25+ hooks (`@/hooks`): `useDebounce`, `useThrottle`, `useMediaQuery`, `useLocalStorage`, `useSessionStorage`, `useClipboard`, `useOnClickOutside`, `useIntersectionObserver`, `useKeyboardShortcut`, `usePrevious`, `useToggle`, `useOnlineStatus`, `useWindowSize`, `useScrollPosition`, `useEventListener`, `useCookieConsent`. Storage wrappers (`@/lib/storage`). `CookieConsentBanner`.

**21 — Performance & PWA:** Code splitting via `next/dynamic`. `VirtualList`, `WebVitalsReporter`, `InstallPWAButton` (`@/components/shared`). `usePWAInstall` (`@/hooks`). Service worker, manifest, pagina `/offline`.

## I. Experiencia do Desenvolvedor

| #   | Spec                                                                     | Status       |
| --- | ------------------------------------------------------------------------ | ------------ |
| 22  | [Estrategia de Testes](i-experiencia-desenvolvedor/estrategia-testes.md) | 🟢 concluido |
| 23  | [Pipeline de Entrega](i-experiencia-desenvolvedor/pipeline-entrega.md)   | 🟢 concluido |

**22 — Estrategia de Testes:** Vitest + Testing Library + MSW + Playwright. `customRender` (`@/tests/utils/render`), factories (`tests/factories`), mock server (`tests/mocks/server`). Setup em `tests/setup.ts`.

**23 — Pipeline de Entrega:** GitHub Actions CI (lint, type-check, test, build). `useFeatureFlag`, `Feature` component (`@/hooks`, `@/components/shared`). Config: `@/config/feature-flags`.

## J. Paginas de Exemplo

| #   | Spec                                                       | Status       |
| --- | ---------------------------------------------------------- | ------------ |
| 24  | [Paginas de Exemplo](j-paginas-exemplo/paginas-exemplo.md) | 🟢 concluido |

**24 — Paginas de Exemplo:** Landing page, dashboard, dados (DataTable + filtros + export), formularios, configuracoes, galeria de componentes, playground de hooks, animacoes. Rotas: `/[locale]/(marketing)/`, `/[locale]/(dashboard)/dashboard/*`, `/[locale]/(examples)/examples/*`.

---

## Referencias Externas

Catalogo de libs, ferramentas e tendencias UI/UX para inspiracao e referencia: **[docs/UI-REFERENCES.md](../UI-REFERENCES.md)**.

---

## Resumo por Status

| Status                | Quantidade |
| --------------------- | ---------- |
| 🔴 Rascunho           | 0          |
| 🟡 Aprovado           | 0          |
| 🔵 Em desenvolvimento | 0          |
| 🟢 Concluido          | 25         |
| **Total**             | **25**     |
