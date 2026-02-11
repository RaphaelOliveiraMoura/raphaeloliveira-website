# Design System

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de design unificado para o Core Stack, baseado em CSS custom properties e Tailwind v4 `@theme`. Define paleta de cores, tipografia (Geist), escala de espacamento, bordas, sombras e tokens de animacao. Suporta tema claro/escuro via `prefers-color-scheme` e toggle por classe, alem de integracao com Framer Motion para transicoes de pagina e micro-interacoes, respeitando `prefers-reduced-motion`.

## Motivacao

Projetos derivados do Core Stack precisam de uma base visual consistente e extensivel. A ausencia de tokens padronizados gera inconsistencia entre paginas e componentes, dificulta manutencao e impede temas (dark mode). O uso do sistema `@theme` do Tailwind v4 permite centralizar tokens e mantê-los alinhados ao ecossistema Tailwind.

## Requisitos Funcionais

- **RF01:** Paleta de cores completa via CSS variables, com suporte a light/dark mode por `prefers-color-scheme` e por toggle de classe (`.dark`)
- **RF02:** Escala tipografica usando Geist (sans e mono) com tamanhos, pesos e line-heights semanticos
- **RF03:** Escala de espacamento consistente (4px base) mapeada em Tailwind
- **RF04:** Tokens de border-radius padronizados (sm, md, lg, xl, full)
- **RF05:** Tokens de sombra (sm, md, lg, xl) para elevacao
- **RF06:** Tokens de duracao e easing para animacoes e transicoes
- **RF07:** Integracao Framer Motion para transicoes de pagina, enter/exit e micro-interacoes
- **RF08:** Respeito a `prefers-reduced-motion` (reducao ou desativacao de animacoes)

## Requisitos Nao-Funcionais

- **RNF01:** Tokens expostos via Tailwind para uso com classes utilitarias
- **RNF02:** TypeScript quando aplicavel (ex: variantes de Framer Motion)
- **RNF03:** Sem impacto negativo em Core Web Vitals; animacoes devem ser performaticas
- **RNF04:** Cores devem atender contraste minimo WCAG 2.1 AA quando aplicavel

## Design da API / Interface

### Cores e Tema (CSS Variables)

```css
/* src/styles/theme.css - Exemplo de tokens de cor */
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --border: #e4e4e7;
  --ring: #18181b;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --primary: #fafafa;
  --primary-foreground: #18181b;
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --border: #27272a;
  --ring: #d4d4d8;
}
```

### Tema Tailwind v4 `@theme`

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-primary: var(--primary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --animate-duration-fast: 150ms;
  --animate-duration-normal: 250ms;
  --animate-duration-slow: 400ms;
  --animate-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Framer Motion - Page Transitions

```tsx
// src/components/layouts/page-transition.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### Framer Motion - Reduced Motion

```tsx
// src/hooks/use-reduced-motion.ts
"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
```

```tsx
// Uso com Framer Motion
const reduced = useReducedMotion();
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: reduced ? 0 : 0.3 }}
>
  {content}
</motion.div>
```

## Estrutura de Arquivos

```
src/
├── app/
│   └── globals.css           # @theme, imports de theme
├── styles/
│   ├── theme.css             # CSS variables (cores, tokens)
│   ├── typography.css        # Classes de tipografia (opcional)
│   └── animations.css        # Tokens de animacao + reduced-motion
├── hooks/
│   └── use-reduced-motion.ts
├── components/
│   └── layouts/
│       └── page-transition.tsx
└── providers/
    └── theme-provider.tsx     # Toggle dark/light por classe
```

## Dependencias

### Bibliotecas Externas

- `framer-motion` - animacoes e transicoes performaticas
- `tailwindcss` v4 - sistema de design via @theme
- `next/font` - Geist (geist-sans, geist-mono)

### Specs Relacionados

- [Componentes & Storybook](./componentes-storybook.md) - componentes consomem tokens
- [Acessibilidade](./acessibilidade.md) - reduced-motion, contraste
- [Layouts & Responsividade](./layouts-responsividade.md) - containers e espacamento

## Notas de Implementacao

- O hook `useReducedMotion` definido nesta spec deve ser implementado em `src/hooks/use-reduced-motion.ts` e exportado via barrel file. Outras specs (Acessibilidade, Animacoes) devem referenciar este hook, nao reimplementa-lo.

## Criterios de Aceite

- [ ] Paleta de cores definida e aplicada em light/dark
- [ ] Toggle de tema por classe `.dark` funcional
- [ ] `prefers-color-scheme` aplicado como fallback
- [ ] Escala tipografica Geist configurada e utilizavel
- [ ] Tokens de espacamento, radius e sombra via @theme
- [ ] Framer Motion configurado com page transition exemplo
- [ ] `useReducedMotion` implementado e animacoes respeitando preferencia
- [ ] Documentacao dos tokens em README ou Storybook
- [ ] Testes unitarios para ThemeProvider (toggle, persistencia, prefers-color-scheme fallback)
- [ ] prefers-color-scheme funciona como fallback quando nenhuma preferencia esta salva

## Referencias

- [Tailwind v4 Theme](https://tailwindcss.com/docs/v4-beta#theme-configuration)
- [Framer Motion](https://www.framer.com/motion/)
- [prefers-reduced-motion - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Geist Font - Vercel](https://vercel.com/font)
- [shadcn/ui - Theming](https://ui.shadcn.com/docs/theming)
