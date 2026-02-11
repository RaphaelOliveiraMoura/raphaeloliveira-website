# Acessibilidade

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Estrategia de acessibilidade para o Core Stack com baseline WCAG 2.1 Nivel AA. Cobre skip links, gerenciamento de foco (focus trap em modais/drawers, restauracao ao fechar), padroes ARIA para componentes comuns, navegacao por teclado (Tab, Shift+Tab, setas, Enter, Escape), regioes live para anuncios dinamicos, respeito a `prefers-reduced-motion`, requisitos de contraste de cor (4.5:1 texto, 3:1 texto grande) e diretrizes para testes com leitores de tela. Formularios acessíveis com labels, erros e descricoes adequadas.

## Motivacao

Acessibilidade garante que produtos sejam utilizáveis por pessoas com deficiencia visual, auditiva, motora ou cognitiva. Cumprir WCAG 2.1 AA e exigido em contratos governamentais e boa pratica em produtos B2B e B2C. Componentes Radix/shadcn ja oferecem base, mas padroes de uso (skip links, focus management, live regions) precisam ser documentados e aplicados consistentemente.

## Requisitos Funcionais

- **RF01:** Skip link para conteudo principal em todas as paginas
- **RF02:** Focus trap em modais, dialogs e drawers; restauracao do foco ao fechar
- **RF03:** Padroes ARIA corretos para Button, Link, Dialog, Menu, Tabs, Accordion, etc.
- **RF04:** Navegacao por teclado: Tab/Shift+Tab, setas em listas/menus, Enter para ativar, Escape para fechar
- **RF05:** Live regions (aria-live) para notificacoes, toasts e conteudo dinamico
- **RF06:** Respeito a `prefers-reduced-motion` em animacoes e transicoes
- **RF07:** Contraste minimo 4.5:1 para texto normal; 3:1 para texto grande e elementos de UI
- **RF08:** Formularios com labels associados, mensagens de erro acessiveis e descricoes quando necessario

## Requisitos Nao-Funcionais

- **RNF01:** WCAG 2.1 Level AA como baseline
- **RNF02:** Componentes Radix/shadcn utilizados conforme documentacao a11y
- **RNF03:** Testes com NVDA/JAWS ou VoiceOver em fluxos criticos
- **RNF04:** ESLint plugin jsx-a11y habilitado

## Design da API / Interface

### Skip Link

```tsx
// src/components/shared/SkipLink.tsx
"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Pular para o conteúdo principal
    </a>
  );
}
```

```tsx
// Uso no layout raiz
// src/app/layout.tsx
<body>
  <SkipLink />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</body>
```

### Focus Trap em Modal (Radix ja faz - exemplo de validacao)

```tsx
// Componentes Radix Dialog ja incluem focus trap
// Garantir que o trigger receba foco ao fechar:
import { useRef } from "react"

export function AccessibleDialog() {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog onOpenChange={(open) => !open && triggerRef.current?.focus()}>
      <DialogTrigger ref={triggerRef} asChild>
        <Button>Abrir</Button>
      </DialogTrigger>
      <DialogContent>
        {/* conteudo do dialog */}
      </DialogContent>
    </Dialog>
  )
}
```

### Padroes ARIA - Menu Dropdown

```tsx
// Radix DropdownMenu ja implementa:
// role="menu", aria-labelledby, aria-orientation="vertical"
// Cada item: role="menuitem", tabIndex={-1}
// Navegacao com setas: ArrowDown/ArrowUp
<DropdownMenu>
  <DropdownMenuTrigger asChild aria-haspopup="menu">
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={...}>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Live Region para Toast

```tsx
// Sonner usa role="status" e aria-live="polite"
// Para mensagens criticas, usar aria-live="assertive"
import { toast } from "sonner";

toast.success("Salvo com sucesso"); // anuncia para leitores de tela
toast.error("Erro ao salvar", {
  description: "Tente novamente em alguns instantes.",
});
```

### Announcer para Conteudo Dinamico

```tsx
// src/components/shared/LiveRegion.tsx
"use client";

import { useEffect, useRef } from "react";

export function LiveRegion({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && ref.current) {
      ref.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
```

### Formulario Acessivel

```tsx
// src/components/forms/AccessibleForm.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export function EmailField() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorId = "email-error";
  const descId = "email-desc";

  return (
    <div>
      <Label htmlFor="email">
        E-mail
      </Label>
      <Input
        id="email"
        type="email"
        autoComplete="email"
        aria-describedby={errors.email ? errorId : descId}
        aria-invalid={!!errors.email}
        aria-required
        {...register("email", { required: "E-mail é obrigatório" })}
      />
      {errors.email && (
        <p id={errorId} className="text-sm text-destructive mt-1" role="alert">
          {errors.email.message as string}
        </p>
      )}
      <p id={descId} className="sr-only">
        Usaremos este e-mail para contato.
      </p>
    </div>
  );
}
```

### Reduced Motion

> **Nota:** O hook `useReducedMotion` e definido e implementado na spec de [Design System](./design-system.md). Esta spec documenta como aplica-lo nos componentes.

```tsx
// src/hooks/useReducedMotion.ts - integrado ao Design System
// Em componentes animados:
const reduced = useReducedMotion();
<motion.div
  transition={{ duration: reduced ? 0 : 0.3 }}
  ...
/>
```

### Utilitario de Contraste (validacao)

```tsx
// src/lib/utils/contrast.ts
export function meetsContrastRatio(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  const ratio = getContrastRatio(foreground, background)
  const threshold = level === "AAA" ? 7 : 4.5
  return ratio >= threshold
}

function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}
```

## Estrutura de Arquivos

```
src/
├── components/
│   └── shared/
│       ├── SkipLink.tsx
│       └── LiveRegion.tsx
├── hooks/
│   └── useReducedMotion.ts
├── app/
│   └── globals.css          # classes sr-only, focus-visible
└── lib/
    └── a11y/                # (opcional) helpers
        └── focusTrap.ts
```

### Classes Tailwind para Acessibilidade

```css
/* sr-only - screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* focus-visible - outline apenas em navegacao por teclado */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

## Dependencias

### Bibliotecas Externas

- `@radix-ui/*` - componentes com suporte a11y built-in
- `eslint-plugin-jsx-a11y` - lint de acessibilidade
- `@axe-core/react` - testes automatizados (opcional)
- `framer-motion` - respeitar reduced-motion
- `react-hook-form` - utilizado nos exemplos de formularios acessiveis (implementacao principal na spec de [Formularios](../b-dados-formularios/formularios.md))

### Specs Relacionados

- [Design System](./design-system.md) - contraste, reduced-motion
- [Componentes & Storybook](./componentes-storybook.md) - addon a11y
- [Layouts & Responsividade](./layouts-responsividade.md) - focus em drawer
- [Formularios](../b-dados-formularios/formularios.md) - labels, erros

## Criterios de Aceite

- [ ] Skip link presente e funcional em layout raiz
- [ ] Modais e drawers com focus trap e restauracao de foco
- [ ] Componentes com ARIA roles e atributos corretos
- [ ] Navegacao por teclado funcionando em menus, tabs, dialogs
- [ ] Live regions para toasts e conteudo dinamico critico
- [ ] `prefers-reduced-motion` respeitado em animacoes
- [ ] Contraste de cores >= 4.5:1 (texto) e >= 3:1 (UI)
- [ ] Formularios com labels, aria-describedby e aria-invalid
- [ ] ESLint jsx-a11y configurado e sem violacoes criticas
- [ ] Checklist de testes manuais com VoiceOver (macOS) e NVDA (Windows) documentado em docs/
- [ ] Utilitario de contraste `meetsContrastRatio` implementado e com testes unitarios

## Referencias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI - Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [MDN - prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)
