# Testes

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Estratégia de testes para o Core Stack usando Vitest para testes unitários (funções, hooks, utilitários), Testing Library para testes de componentes React, MSW (Mock Service Worker) para mock de APIs, e Playwright para testes end-to-end (E2E). Inclui organização de arquivos (co-localizados vs separados), factories e fixtures para dados consistentes, custom render com providers, estratégia de cobertura e padrões para testes de hooks, async, formulários e rotas.

## Motivacao

Projetos Next.js precisam de uma pirâmide de testes clara: muitos testes unitários rápidos, menos testes de integração e poucos E2E. Sem padrões definidos, cada equipe adota soluções diferentes, dificultando manutenção. O Core Stack deve fornecer setup pronto e convenções para que projetos derivados possam escrever testes consistentes desde o início, com foco em confiabilidade e velocidade de execução.

## Requisitos Funcionais

- **RF01:** Vitest configurado para testes unitários (Jest-compatible API)
- **RF02:** React Testing Library para testes de componentes com queries acessíveis
- **RF03:** MSW para interceptação de requisições HTTP em testes
- **RF04:** Playwright para E2E em Chromium (extensível para Firefox/WebKit)
- **RF05:** Organização de testes:
  - **Componentes:** Testes co-localizados (`Button.test.tsx` junto de `Button.tsx`)
  - **Hooks:** Testes co-localizados (`useDebounce.test.ts` junto de `useDebounce.ts`)
  - **Lib/utils:** Testes em `tests/` espelhando a estrutura de `src/lib/` (ex: `tests/lib/api/client.test.ts`)
  - **E2E:** Sempre em `tests/e2e/`
- **RF06:** Factories e fixtures para geração de dados de teste consistentes
- **RF07:** Custom `render` com providers (Theme, Auth, i18n, etc.)
- **RF08:** Thresholds minimos configurados no vitest.config.ts:
  - **Statements:** 80%
  - **Branches:** 70%
  - **Functions:** 80%
  - **Lines:** 80%
- **RF09:** Padrões documentados: renderHook, testes async, formulários, rotas

## Requisitos Nao-Funcionais

- **RNF01:** Testes unitários devem executar em < 10s para suíte completa
- **RNF02:** E2E devem ser executáveis em CI e localmente
- **RNF03:** MSW handlers reutilizáveis e compartilháveis
- **RNF04:** Sem dependências de ambiente externo (banco, APIs reais) nos testes unitários

## Design da API / Interface

### Vitest + Testing Library Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.config.*', '**/index.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### Custom Render com Providers

```tsx
// tests/utils/render.tsx
import { render, type RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: AllProviders,
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };
```

### Teste de Hooks com renderHook

```tsx
// src/hooks/useDebounce.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates debounced value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(300));
    await waitFor(() => expect(result.current).toBe('b'));
  });
});
```

### Teste de Componente

```tsx
// src/components/ui/Button.test.tsx
import { render, screen, userEvent } from '@/tests/utils/render';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### MSW para Mock de API

`tests/mocks/handlers.ts` define os request handlers. `tests/mocks/server.ts` configura a instancia do MSW server.

```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      users: [
        { id: '1', name: 'John', email: 'john@example.com' },
      ],
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: 'John',
      email: 'john@example.com',
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '2', ...body }, { status: 201 });
  }),
];
```

```ts
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```ts
// tests/setup.ts - Setup global do Vitest (referencia o server)
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Factories e Fixtures

```tsx
// src/tests/factories/factory.ts
export function factory<T>(defaults: () => T) {
  return {
    build(overrides: Partial<T> = {}): T {
      return { ...defaults(), ...overrides }
    },
    buildList(count: number, overrides: Partial<T> = {}): T[] {
      return Array.from({ length: count }, () => this.build(overrides))
    },
  }
}

// Usage:
export const userFactory = factory<User>(() => ({
  id: crypto.randomUUID(),
  name: "Joao Silva",
  email: "joao@example.com",
  role: "user" as const,
  createdAt: new Date().toISOString(),
}))

const user = userFactory.build({ name: "Maria" })
const users = userFactory.buildList(5, { role: "admin" })
```

> **Nota:** `crypto.randomUUID()` esta disponivel no Node.js 19+. Para versoes anteriores, usar `crypto.getRandomValues` ou um polyfill.

### Teste Async e Formulário

```tsx
// Teste async com findBy
it('loads and displays user data', async () => {
  render(<UserProfile userId="1" />);
  expect(screen.getByRole('status')).toHaveTextContent(/loading/i);

  const heading = await screen.findByRole('heading', { name: /john/i });
  expect(heading).toBeInTheDocument();
});

// Teste de formulário com react-hook-form
it('submits form with valid data', async () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
  await userEvent.type(screen.getByLabelText(/senha/i), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
```

### Playwright E2E

```ts
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Core Stack/i);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Documentação');
    await expect(page).toHaveURL(/.*docs/);
  });
});
```

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Estrutura de Arquivos

```
tests/
├── setup.ts                 # Vitest setup, MSW server
├── utils/
│   └── render.tsx           # Custom render com providers
├── mocks/
│   ├── handlers.ts          # MSW handlers
│   └── server.ts            # MSW server config
├── factories/
│   ├── factory.ts           # Factory base
│   ├── user.ts
│   └── index.ts
├── fixtures/
│   └── *.json               # Dados estáticos quando necessário
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx   # Co-localizado
├── hooks/
│   ├── useDebounce.ts
│   └── useDebounce.test.ts
├── lib/
│   └── formatters/
│       ├── formatCurrency.ts
│       └── formatCurrency.test.ts
e2e/
├── smoke.spec.ts
├── auth.spec.ts
└── playwright.config.ts
```

## Dependencias

### Bibliotecas Externas

- `vitest` — runner de testes unitários
- `@vitejs/plugin-react` — suporte React para Vitest
- `jsdom` — ambiente DOM para testes
- `@testing-library/react` — queries e render
- `@testing-library/user-event` — simulação de interações do usuário
- `msw` — Mock Service Worker para APIs
- `@playwright/test` — E2E
- `@vitest/coverage-v8` — cobertura

### Specs Relacionados

- [Formularios](../b-dados-formularios/formularios.md) — padrões de teste de forms
- [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) — MSW handlers para API
- [Pipeline de Entrega](./pipeline-entrega.md) — execução de testes em CI

## Criterios de Aceite

- [ ] Vitest configurado com jsdom e path alias @/
- [ ] Custom render com providers disponível em tests/utils/render
- [ ] MSW configurado com handlers MSW para: GET/POST /users, POST /auth/login, POST /auth/refresh
- [ ] Factories para User e pelo menos 2 entidades adicionais de exemplo
- [ ] Playwright configurado com webServer apontando para app
- [ ] Exemplos de teste: hook (useDebounce), componente (Button), async, form
- [ ] Cobertura com thresholds configurados
- [ ] npm run test executa Vitest
- [ ] npm run test:e2e executa Playwright
- [ ] Documentação de padrões de teste em README ou CONTRIBUTING

## Notas de Implementacao

- Os handlers MSW devem cobrir as rotas definidas na spec de [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md).
- O `customRender` inclui todos os providers necessarios (Theme, Auth, i18n, QueryClient). Manter atualizado conforme novos providers sao adicionados.
- Playwright testes E2E devem ser executados contra o build de producao (`npm run build && npm start`), nao o dev server.

## Referencias

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW](https://mswjs.io/)
- [Playwright](https://playwright.dev/)
- [Testing Library - renderHook](https://testing-library.com/docs/react-testing-library/api#renderhook)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
