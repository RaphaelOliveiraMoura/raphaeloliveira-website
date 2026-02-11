---
name: storybook-v10
description: |
  Storybook 10 for React/Next.js projects. Covers ESM-only distribution, CSF Next typesafe factories, tags-based filtering, autodocs, addon-a11y, interaction testing, and migration from v8/v9.

  Use when writing stories, configuring Storybook, adding addons, writing component tests with play functions, or when the user mentions Storybook, stories, .stories.tsx, or component documentation.
---

# Storybook 10

**Versions**: @storybook/react@10.2.8, @storybook/nextjs@10.2.8, @storybook/addon-a11y@10.2.8
**Migration**: `npx storybook@latest upgrade`
**Docs**: https://storybook.js.org/docs

---

## Key Changes in v10

### ESM-Only Distribution

Storybook 10 is fully ESM. All config files must be valid ESM.

```ts
// .storybook/main.ts - must be ESM (export default, no require())
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
  tags: ["autodocs"],
};

export default config;
```

**Requirements**: Node 20.19+ or 22.12+

### CSF Next - Typesafe Factories (new)

Better type inference and autocompletion for stories:

```tsx
import { config } from "#.storybook/preview";
import { defineMain } from "@storybook/react/node";

// main.ts - typesafe config
export default defineMain(config, {
  stories: ["../stories/**/*.stories.tsx"],
});
```

### Tags-Based Filtering (improved)

Control which stories appear in sidebar, docs, and testing:

```tsx
// In main.ts - global tags
const config: StorybookConfig = {
  tags: ["autodocs"],  // enable autodocs for all stories
};

// Per-story tags
export const MyStory: Story = {
  tags: ["!autodocs"],  // exclude this story from autodocs
};
```

---

## Writing Stories (CSF 3)

### Basic Story

```tsx
// stories/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/button";

const meta = {
  title: "Basic/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
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
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "outline",
    size: "icon",
  },
  render: (args) => (
    <Button {...args}>
      <span>+</span>
    </Button>
  ),
};
```

### Story with Decorators

```tsx
const meta = {
  title: "Shared/Card",
  component: Card,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;
```

### Story with Play Function (Interaction Testing)

```tsx
import { expect, userEvent, within } from "@storybook/test";

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("Email"), "test@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "secret123");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));

    await expect(canvas.getByText("Success")).toBeInTheDocument();
  },
};
```

### Story with Args Mapping

```tsx
const meta = {
  title: "Basic/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
} satisfies Meta<typeof Badge>;
```

---

## Configuration

### preview.ts

```ts
import type { Preview } from "@storybook/react";

import "../src/app/globals.css"; // import global styles (Tailwind, theme)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Basic", "Form", "Feedback", "Overlay", "Navigation", "Data", "Layout", "Shared"],
      },
    },
    layout: "centered",  // "centered" | "fullscreen" | "padded"
  },
};

export default preview;
```

### Addons

```ts
// main.ts
addons: [
  "@storybook/addon-a11y",     // accessibility checks
  // Other common addons:
  // "@storybook/addon-themes",  // theme switching
  // "@storybook/addon-viewport", // responsive testing
],
```

### Next.js Framework

With `@storybook/nextjs`, Next.js features work automatically:
- `next/image` optimization
- `next/font` support
- `next/navigation` mocks
- CSS/Tailwind support
- Path aliases (`@/`)

---

## Critical Rules

### Always Do

- Use `satisfies Meta<typeof Component>` for type safety (not `as Meta`)
- Use `StoryObj<typeof meta>` for story types (not manual typing)
- Export `meta` as `default export` (CSF requirement)
- Use named exports for stories (`export const Primary: Story = {}`)
- Import global CSS in `preview.ts` for Tailwind/theme support
- Use `args` for component props that should be controllable
- Use `render` function for stories that need custom JSX wrapping
- Use `tags: ["autodocs"]` in main.ts for automatic documentation

### Never Do

- Never use `require()` in config files (ESM-only)
- Never use CommonJS syntax (`module.exports`)
- Never mix CSF 2 and CSF 3 in the same file
- Never define stories without `satisfies Meta` type (loses autocompletion)
- Never use `.story` file extension (use `.stories.tsx`)

---

## Common Patterns

### Composition with shadcn/ui

```tsx
// Stories for composed components that use shadcn/ui primitives
import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const meta = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "Delete item?",
  },
};
```

### Responsive Stories

```tsx
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    layout: "fullscreen",
  },
};
```

### Dark Mode Stories

```tsx
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
```

---

## Migration from v8/v9

```bash
npx storybook@latest upgrade
```

Key changes:
- All config must be valid ESM (no `require()`, use `import`)
- `storiesOf` API fully removed (use CSF 3)
- `@storybook/testing-library` -> `@storybook/test`
- `test-runner` deprecated -> use `addon-vitest` for Vite projects
- Node 20.19+ or 22.12+ required

**Troubleshooting**: run `npx storybook doctor` to check for issues.

**Official docs**: https://storybook.js.org/docs
