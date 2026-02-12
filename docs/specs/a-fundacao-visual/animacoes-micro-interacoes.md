# Animacoes & Micro-Interacoes

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de animacoes e micro-interacoes do Core Stack, baseado em Framer Motion e CSS, com primitivos reutilizaveis, variantes pre-definidas, tokens de animacao mapeados no Tailwind e respeito global a `prefers-reduced-motion` via `MotionProvider`.

## Motivacao

Animacoes e micro-interacoes bem executadas elevam a percepcao de qualidade de uma aplicacao, fornecendo feedback visual imediato, guiando atencao do usuario e criando uma experiencia fluida. O Core Stack precisa de primitivos reutilizaveis que qualquer projeto derivado possa usar consistentemente, sem reimplementar logica de animacao em cada componente.

## Requisitos Funcionais

- **RF01:** Primitivos de animacao reutilizaveis (`FadeIn`, `StaggerChildren`, `StaggerItem`, `SlideIn`, `ScaleOnHover`, `AnimateOnScroll`, `CountUp`, `TypeWriter`)
- **RF02:** Variantes Framer Motion pre-definidas (`fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `scaleIn`, `bounceIn`, `staggerContainer`, `slideIn`)
- **RF03:** `MotionProvider` global com `MotionConfig reducedMotion="user"` integrado ao root layout
- **RF04:** Tokens de animacao mapeados no Tailwind `@theme` (`duration-fast`, `duration-normal`, `duration-slow`, `ease-in`, `ease-out`, `ease-in-out`)
- **RF05:** Keyframes CSS adicionais (`shimmer`, `shake`, `wiggle`, `draw`, `glow-pulse`, `fade-in-up`, `fade-in-down`, `slide-in-left`, `slide-in-right`, `scale-in`, `bounce-in`, `gradient-shift`)
- **RF06:** Page transitions ativadas nos layouts marketing e dashboard via `PageTransition`
- **RF07:** Micro-interacoes em componentes base: button hover/active scale, card hover lift, tabs content fade-in, skeleton shimmer
- **RF08:** Scroll-based reveals via `AnimateOnScroll`, scroll progress bar via `ScrollProgress`, back-to-top via `BackToTop`
- **RF09:** Dark mode crossfade suave via CSS transitions no body
- **RF10:** Entrada animada em estados: `EmptyState` com bounce-in escalonado, `ErrorState` com wiggle no icone
- **RF11:** `LoadingButton` com transicoes animadas entre estados (texto → spinner → check)
- **RF12:** Sidebar com active indicator animado (`layoutId`), toggle icon com rotacao, labels com fade in/out
- **RF13:** Navbar marketing com blur/shadow on scroll
- **RF14:** FormWizard com slide transitions entre steps
- **RF15:** DataTable com sort icon rotation e row hover refinado
- **RF16:** BulkActionBar com slide-in animado
- **RF17:** Pagina de exemplo com demos interativas de todos os primitivos

## Requisitos Nao-Funcionais

- **RNF01:** Acessibilidade - `prefers-reduced-motion` respeitado globalmente via `MotionConfig` e CSS media query
- **RNF02:** Performance - animacoes usam `transform` e `opacity` (composited properties), sem layout thrashing
- **RNF03:** TypeScript - todos os componentes com tipos seguros, props documentadas
- **RNF04:** Sem impacto em Core Web Vitals - animacoes nao bloqueiam main thread
- **RNF05:** Internacionalizacao - textos em pagina de exemplo via `useTranslations`

## Design da API / Interface

### Primitivos de Animacao

```tsx
import {
  FadeIn,
  SlideIn,
  StaggerChildren,
  StaggerItem,
  ScaleOnHover,
  AnimateOnScroll,
  CountUp,
  TypeWriter,
} from "@/lib/motion";

// FadeIn - Entrada com fade e translate
<FadeIn direction="up" delay={0.2} duration={0.4}>
  <h1>Titulo</h1>
</FadeIn>

// SlideIn - Slide de qualquer direcao
<SlideIn direction="left" distance={30} delay={0}>
  <aside>Sidebar</aside>
</SlideIn>

// StaggerChildren + StaggerItem - Entrada escalonada
<StaggerChildren staggerDelay={0.1}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card>{item.name}</Card>
    </StaggerItem>
  ))}
</StaggerChildren>

// ScaleOnHover - Scale sutil no hover
<ScaleOnHover scale={1.03}>
  <Card>Hover me</Card>
</ScaleOnHover>

// AnimateOnScroll - Anima ao entrar no viewport
<AnimateOnScroll variants={fadeInUp} threshold={0.2} once>
  <section>Visivel ao rolar</section>
</AnimateOnScroll>

// CountUp - Numeros animados
<CountUp end={78} suffix="+" duration={2} />

// TypeWriter - Efeito de digitacao
<TypeWriter text="Bem-vindo ao Core Stack" speed={50} cursor />
```

### Variantes Pre-definidas

```tsx
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  bounceIn,
  staggerContainer,
  slideIn,
  springTransition,
  smoothTransition,
  fastTransition,
} from "@/lib/motion";

// Usar com motion.div
<motion.div
  variants={fadeInUp}
  initial="initial"
  animate="animate"
  transition={smoothTransition}
>
  Conteudo
</motion.div>;

// slideIn dinamico
const variants = slideIn("right", 50);

// staggerContainer com delay customizado
const container = staggerContainer(0.15);
```

### Componentes de Scroll

```tsx
import { ScrollProgress, BackToTop } from "@/components/shared";

// Barra de progresso no topo da pagina
<ScrollProgress />

// Botao back-to-top com fade
<BackToTop threshold={400} className="fixed bottom-6 right-6" />
```

### Keyframes CSS (via Tailwind)

```html
<!-- Shimmer (skeleton) -->
<div
  class="animate-shimmer bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%]"
/>

<!-- Shake (erro) -->
<div class="animate-shake" />

<!-- Wiggle (icone de erro) -->
<div class="animate-wiggle" />

<!-- Glow pulse (destaque) -->
<div class="animate-glow-pulse" />

<!-- Fade in up -->
<div class="animate-fade-in-up" />
```

### Tokens de Duracao/Easing

```html
<!-- Duracoes -->
<div class="duration-fast" />
<!-- 150ms -->
<div class="duration-normal" />
<!-- 250ms -->
<div class="duration-slow" />
<!-- 400ms -->

<!-- Easings -->
<div class="ease-in" />
<div class="ease-out" />
<div class="ease-in-out" />
```

## Regras de Uso

### Import

Sempre importar primitivos de animacao via `@/lib/motion`:

```tsx
// CERTO
import { FadeIn, fadeInUp, AnimateOnScroll } from "@/lib/motion";

// ERRADO - import direto dos arquivos internos
import { FadeIn } from "@/lib/motion/components";
```

### Reduced Motion

O `MotionProvider` ja configura `MotionConfig reducedMotion="user"` globalmente. Para animacoes CSS customizadas, o media query em `animations.css` ja desabilita tudo. Nao e necessario checar manualmente na maioria dos casos. Para logica condicional especifica, usar:

```tsx
import { useReducedMotion } from "@/hooks";

const reduced = useReducedMotion();
// Desabilitar parallax, efeitos pesados, etc.
```

### Performance

- Preferir `transform` e `opacity` para animacoes (GPU-accelerated)
- Usar `will-change` com parcimonia (apenas em elementos que realmente animam frequentemente)
- `AnimateOnScroll` com `once={true}` (padrao) para evitar re-animacao desnecessaria
- `CountUp` usa `requestAnimationFrame` para animacao de numeros (nao bloqueia main thread)

## Estrutura de Arquivos

```
src/
├── lib/
│   └── motion/
│       ├── components.tsx     # Primitivos: FadeIn, StaggerChildren, etc.
│       ├── variants.ts        # Variantes e transicoes pre-definidas
│       └── index.ts           # Barrel file
├── providers/
│   └── motion-provider.tsx    # MotionConfig global
├── components/
│   ├── layouts/
│   │   └── page-transition.tsx  # Transicao entre paginas
│   └── shared/
│       ├── back-to-top.tsx      # Botao voltar ao topo
│       ├── scroll-progress.tsx  # Barra de progresso de scroll
│       ├── loading-button.tsx   # Botao com transicoes animadas
│       ├── empty-state.tsx      # Estado vazio com entrada animada
│       └── error-state.tsx      # Estado de erro com shake/wiggle
├── styles/
│   └── animations.css         # Keyframes e tokens CSS
└── app/
    └── globals.css            # Tokens mapeados no @theme
```

## Dependencias

### Bibliotecas Externas

- `framer-motion` (^12.34.0) - animacoes e transicoes performaticas (ja existente)
- `tw-animate-css` (^1.4.0) - utilidades de animacao para Tailwind (ja existente)

### Specs Relacionados

- [Design System](./design-system.md) - tokens de cor, tipografia e espacamento
- [Acessibilidade](./acessibilidade.md) - reduced-motion, WCAG 2.1 AA
- [Feedback & Orientacao](../f-padroes-ux/feedback-orientacao.md) - empty/error/loading states
- [Paginas de Exemplo](../j-paginas-exemplo/paginas-exemplo.md) - pagina de demonstracao de animacoes

## Criterios de Aceite

- [x] Primitivos de animacao implementados e exportados via `@/lib/motion`
- [x] Variantes Framer Motion pre-definidas
- [x] `MotionProvider` integrado ao root layout
- [x] Tokens de animacao mapeados no Tailwind `@theme`
- [x] Keyframes CSS adicionais (shimmer, shake, wiggle, draw, glow-pulse, etc.)
- [x] Page transitions ativadas nos layouts marketing e dashboard
- [x] Micro-interacoes: button hover/active, card lift, skeleton shimmer
- [x] `AnimateOnScroll`, `ScrollProgress`, `BackToTop` implementados
- [x] Dark mode crossfade suave
- [x] EmptyState e ErrorState com animacoes de entrada
- [x] LoadingButton com transicoes entre estados
- [x] Sidebar com active indicator e toggle animados
- [x] Navbar com blur/shadow on scroll
- [x] FormWizard com slide transitions
- [x] DataTable com sort icon rotation
- [x] BulkActionBar com slide-in
- [x] `prefers-reduced-motion` respeitado globalmente
- [x] Pagina de exemplo com demos interativas
- [x] Barrel files atualizados
- [x] Documentacao completa na spec

## Referencias

- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS v4 - Animations](https://tailwindcss.com/docs/animation)
- [prefers-reduced-motion - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web Animations Performance](https://web.dev/animations-overview/)
