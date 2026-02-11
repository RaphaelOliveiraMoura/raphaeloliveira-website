# Componentes & Storybook

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Catalogo completo de aproximadamente 30 componentes shadcn/ui organizados por categoria (Basic, Form, Feedback, Overlay, Navigation, Data, Layout). Inclui setup do Storybook para Next.js 16 + Tailwind v4, padrao de organizacao de stories, configuracao de Autodocs e suporte a testes de regressao visual (Chromatic ou similar).

## Motivacao

Projetos Next.js precisam de um conjunto padrao de componentes UI reutilizaveis e documentados. shadcn/ui oferece componentes acessíveis baseados em Radix UI, mas requer configuracao e documentacao centralizadas. O Storybook permite visualizar variantes, testar estados e facilitar manutencao e onboarding de devs.

## Requisitos Funcionais

- **RF01:** Instalacao e configuracao dos seguintes componentes shadcn/ui organizados por categoria:
  - **Basic:** Button, Input, Textarea, Label, Badge, Separator
  - **Form:** Select, Combobox, Checkbox, Radio Group, Switch, Slider, Calendar, DatePicker
  - **Feedback:** Toast (Sonner), Alert, Skeleton, Progress, Spinner
  - **Overlay:** Dialog, Sheet, Popover, Tooltip, Dropdown Menu
  - **Navigation:** Tabs, Accordion, Breadcrumb, Command, Navigation Menu
  - **Data:** Table, Pagination, Card, Avatar
  - **Layout:** ScrollArea, AspectRatio, Collapsible
- **RF02:** Storybook configurado para Next.js 16 App Router e Tailwind v4
- **RF03:** Stories organizadas por pasta espelhando categorias de componentes
- **RF04:** Autodocs habilitado para documentacao automatica de props
- **RF05:** Suporte a testes de regressao visual (Chromatic ou Playwright)

## Requisitos Nao-Funcionais

- **RNF01:** Componentes seguem design tokens do [Design System](./design-system.md)
- **RNF02:** Acessibilidade WCAG 2.1 AA conforme [spec de Acessibilidade](./acessibilidade.md)
- **RNF03:** TypeScript estrito; componentes tipados corretamente
- **RNF04:** Build do Storybook deve passar sem erros

## Design da API / Interface

### Estrutura de Pastas para Componentes

```
src/components/ui/
├── button.tsx
├── input.tsx
├── textarea.tsx
├── label.tsx
├── badge.tsx
├── separator.tsx
├── select.tsx
├── ...
└── index.ts  # barrel export
```

### Exemplo de Story - Button

```tsx
// stories/Basic/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "Basic/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Botao baseado em Radix UI, com variantes e tamanhos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
```

### Exemplo de Story - Dialog (Overlay)

```tsx
// stories/Overlay/Dialog.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Dialog> = {
  title: "Overlay/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Optional description of the dialog content.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
```

### Configuracao Storybook (.storybook/main.ts)

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, "../src"),
      };
    }
    return config;
  },
};

export default config;
```

### Ordenacao de Categorias no Sidebar

```ts
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Basic",
          "Form",
          "Feedback",
          "Overlay",
          "Navigation",
          "Data",
          "Layout",
        ],
      },
    },
  },
};

export default preview;
```

## Estrutura de Arquivos

```
core-stack/
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── manager.ts          # (opcional) tema customizado
├── stories/
│   ├── Basic/
│   │   ├── Button.stories.tsx
│   │   ├── Input.stories.tsx
│   │   ├── Label.stories.tsx
│   │   ├── Badge.stories.tsx
│   │   └── Separator.stories.tsx
│   ├── Form/
│   │   ├── Select.stories.tsx
│   │   ├── Checkbox.stories.tsx
│   │   ├── Switch.stories.tsx
│   │   ├── Calendar.stories.tsx
│   │   └── ...
│   ├── Feedback/
│   │   ├── Toast.stories.tsx
│   │   ├── Alert.stories.tsx
│   │   └── Skeleton.stories.tsx
│   ├── Overlay/
│   │   ├── Dialog.stories.tsx
│   │   ├── Sheet.stories.tsx
│   │   └── Popover.stories.tsx
│   ├── Navigation/
│   │   ├── Tabs.stories.tsx
│   │   ├── Accordion.stories.tsx
│   │   └── Breadcrumb.stories.tsx
│   ├── Data/
│   │   ├── Table.stories.tsx
│   │   ├── Card.stories.tsx
│   │   └── Pagination.stories.tsx
│   └── Layout/
│       ├── ScrollArea.stories.tsx
│       ├── AspectRatio.stories.tsx
│       └── Collapsible.stories.tsx
├── src/
│   └── components/
│       └── ui/
│           ├── button.tsx
│           ├── ...
│           └── index.ts
└── chromatic.yml          # (opcional) CI para Chromatic
```

## Dependencias

### Bibliotecas Externas

- `@storybook/nextjs` - Storybook para Next.js
- `@storybook/addon-essentials` - controles, actions, viewport
- `@storybook/addon-a11y` - verificacao de acessibilidade
- `@storybook/addon-links` - links entre stories
- `@radix-ui/*` - componentes base (via shadcn)
- `class-variance-authority` (cva) - variantes de componentes
- `tailwind-merge` - merge de classes Tailwind
- `lucide-react` - icones
- `sonner` - Toast
- `react-day-picker` - Calendar/DatePicker
- `@radix-ui/react-popover` - Combobox
- `cmdk` - Command palette

### Specs Relacionados

- [Design System](./design-system.md) - tokens visuais
- [Acessibilidade](./acessibilidade.md) - addon a11y, testes
- [Testes](../i-experiencia-desenvolvedor/estrategia-testes.md) - integracao com testes

## Criterios de Aceite

- [ ] 30 componentes (conforme listados no RF01) shadcn/ui instalados e exportados
- [ ] Storybook inicia com `npm run storybook` sem erros
- [ ] Tailwind v4 aplicado corretamente nas stories
- [ ] Stories organizadas em Basic, Form, Feedback, Overlay, Navigation, Data, Layout
- [ ] Autodocs configurado e exibindo props
- [ ] Addon a11y instalado e funcional
- [ ] Pelo menos um story de exemplo por categoria
- [ ] Visual regression testing configurado via Playwright screenshots (Chromatic como alternativa opcional)
- [ ] README com instrucoes de adicao de novos componentes

## Referencias

- [shadcn/ui - Components](https://ui.shadcn.com/docs/components)
- [Storybook for Next.js](https://storybook.js.org/docs/get-started/nextjs)
- [Storybook Autodocs](https://storybook.js.org/docs/react/writing-docs/autodocs)
- [Chromatic](https://www.chromatic.com/)
- [Radix UI](https://www.radix-ui.com/primitives)
