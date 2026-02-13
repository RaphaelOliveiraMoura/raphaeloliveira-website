# Catalogo de Features

Referencia de todas as funcionalidades implementadas no Core Stack, com API surface, componentes, hooks e paths.

---

## A. Fundacao Visual

**Design System:** CSS variables + Tailwind v4 `@theme` (cores, tipografia Geist, espacamento, radius, sombras), tema dark/light via `ThemeProvider`, tokens de animacao (`duration-fast`, `ease-in-out`), `PageTransition`, `useReducedMotion`.

**Componentes & Storybook:** ~30 componentes shadcn/ui (`@/components/ui/*`) organizados por categoria (Basic, Form, Feedback, Overlay, Navigation, Data, Layout). Storybook 10 com stories em `stories/`.

**Layouts & Responsividade:** Layouts Marketing, Dashboard e Auth. Sidebar colapsavel/drawer mobile (`@/components/layouts/dashboard-sidebar`), navbar, footer. Hooks: `useMediaQuery`, `useBreakpoint`, `useIsMobile`, `useIsDesktop`.

**Acessibilidade:** WCAG 2.1 AA: `SkipLink`, `LiveRegion`, focus trap em modais, ARIA patterns, `meetsContrastRatio` (`@/lib/utils/contrast`).

**Animacoes & Micro-Interacoes:** Primitivos Framer Motion (`@/lib/motion`): `FadeIn`, `SlideIn`, `StaggerChildren`, `AnimateOnScroll`, `CountUp`, `TypeWriter`. `ScrollProgress`, `BackToTop`, `MotionProvider`. Keyframes CSS: `shimmer`, `shake`, `wiggle`, `gradient-shift`, `marquee`, `border-beam`. Componentes visuais de marketing (`@/components/shared`): `DotPattern`, `AnimatedGradientText`, `BorderBeam`, `Marquee`, `BentoGrid`/`BentoCard`.

## B. Dados & Formularios

**Formularios:** react-hook-form + Zod. `Form`, `FormWizard`, `MaskedInput` (`@/components/shared`). Schemas compartilhados (`@/lib/validation/schemas/shared`). Mascaras: CPF, CNPJ, CEP, telefone, moeda (`@/lib/masks`).

**Formatadores & Date/Time:** `@/lib/formatters`: `formatCurrency`, `abbreviateNumber`, `formatCpf`, `formatCnpj`, `formatCep`, `truncate`, `capitalize`, `slugify`, `pluralize`. `@/lib/datetime`: `formatDate`, `formatRelativeTime`, `formatDateRange`, `formatInUserTimezone`.

**Exibicao & Gestao de Dados:** `DataTable`, `VirtualizedDataTable`, `TableFilters`, `BulkActionBar`, `EditableCell`, `InfiniteList`, `EmptyState`, `GridListViewToggle` (`@/components/shared`). Export CSV/Excel/JSON/PDF (`@/lib/data/export`). Padroes CRUD.

## C. API & Servidor

**Cliente API & Erros:** `createApiClient`, `apiClient` (`@/lib/api/client`), `ApiError`, `normalizeApiError` (`@/lib/api/errors`). `QueryProvider` (`@/providers/query-provider`). `ErrorBoundary`, `ErrorState`, `LoadingFallback` (`@/components/shared`).

**Servidor & Real-time:** Server Actions com Zod, API Routes, middleware, ISR. `useWebSocket`, `useSSE`, `usePolling` (`@/lib/realtime`).

## D. Navegacao

**Navegacao, URL & Busca:** `useUrlState`, `useUrlStateMulti`, `useUrlPagination` (`@/hooks`). `Breadcrumbs`, `CommandPalette` (`@/components/navigation`). `GlobalSearch`, `HighlightMatch`, `SearchResultItem` (`@/components/search`). `useSearchResults`, `useRecentSearches`.

## E. Infraestrutura

**Internacionalizacao:** next-intl com App Router. `Link`, `useRouter`, `usePathname`, `useTranslations`, `useLocale`, `useDateFormatter`, `useNumberFormatter` (`@/lib/i18n`). `LanguageSwitcher` (`@/components/shared`). Locales: pt-BR, en, es.

**SEO:** `generateMetadataBase` (`@/lib/seo/metadata`). JSON-LD: `buildOrganizationJsonLd`, `buildProductJsonLd`, `buildArticleJsonLd`, `buildBreadcrumbJsonLd` (`@/lib/seo/json-ld`). `JsonLd` component. `sitemap.ts`, `robots.ts`.

**Autenticacao & Autorizacao:** `useAuth`, `usePermissions` (`@/hooks`). `Can`, `PermissionButton`, `RequirePermission` (`@/components/auth`). `AuthProvider` (`@/providers`). RBAC, `getSession` (`@/lib/auth/session`). Middleware de protecao.

**Seguranca & Configuracao:** `env` tipado via t3-env/zod (`@/config/env`). `sanitizeHtml` (`@/lib/security/sanitize`). `getSecurityHeaders`, `generateCsrfToken`, `validateCsrfToken`, `createClientRateLimiter` (`@/lib/security`). `useThrottle`.

**Logging & Telemetria:** `logger` com niveis debug/info/warn/error (`@/lib/telemetry/logger`). `track` analytics (`@/lib/telemetry/analytics`). `reportWebVitals` (`@/lib/telemetry/web-vitals`). `WebVitalsReporter`, `PageViewTracker` (`@/components/telemetry`). `useTrackEvent`.

## F. Padroes de UX

**Feedback & Orientacao:** `toast` (success, error, warning, info, promise) (`@/lib/feedback/toast`). `EmptyState`, `ErrorState`, `SkeletonPresets`, `ConfirmDialog`, `LoadingButton`, `NotificationCenter`, `Tour`, `OfflineBanner` (`@/components/shared`). `useNotifications`, `useOnlineStatus`.

**Interacoes Avancadas:** `useClipboard`, `useShare`, `useKeyboardShortcut` (`@/hooks`). `ShortcutProvider`, `CheatSheet`. `SortableList`, `KanbanBoard` (`@/components/shared`) via @dnd-kit.

## G. Media & Conteudo

**Arquivos & Media:** `FileUpload`, `ImageCropUpload`, `Lightbox`, `Avatar`, `ResponsiveImage`, `VideoPlayer` (`@/components/shared`). `downloadWithProgress` (`@/lib/media`).

**Conteudo Rico:** `MarkdownContent`, `CodeBlock`, `RichTextEditor`, `ResponsiveEmbed`, `TableOfContents` (`@/components/content`). Sanitizacao via `@/lib/security/sanitize`. Prose styles em `prose.css`.

## H. Plataforma

**Hooks & Utilitarios:** 25+ hooks (`@/hooks`): `useDebounce`, `useThrottle`, `useMediaQuery`, `useLocalStorage`, `useSessionStorage`, `useClipboard`, `useOnClickOutside`, `useIntersectionObserver`, `useKeyboardShortcut`, `usePrevious`, `useToggle`, `useOnlineStatus`, `useWindowSize`, `useScrollPosition`, `useEventListener`, `useCookieConsent`. Storage wrappers (`@/lib/storage`). `CookieConsentBanner`.

**Performance & PWA:** Code splitting via `next/dynamic`. `VirtualList`, `WebVitalsReporter`, `InstallPWAButton` (`@/components/shared`). `usePWAInstall` (`@/hooks`). Service worker, manifest, pagina `/offline`.

## I. Experiencia do Desenvolvedor

**Estrategia de Testes:** Vitest + Testing Library + MSW + Playwright. `customRender` (`@/tests/utils/render`), factories (`tests/factories`), mock server (`tests/mocks/server`). Setup em `tests/setup.ts`.

**Pipeline de Entrega:** GitHub Actions CI (lint, type-check, test, build). `useFeatureFlag`, `Feature` component (`@/hooks`, `@/components/shared`). Config: `@/config/feature-flags`.

## J. Paginas de Exemplo

**Paginas de Exemplo:** Landing page, dashboard, dados (DataTable + filtros + export), formularios, configuracoes, galeria de componentes, playground de hooks, animacoes. Rotas: `/[locale]/(marketing)/`, `/[locale]/(dashboard)/dashboard/*`, `/[locale]/(examples)/examples/*`.
