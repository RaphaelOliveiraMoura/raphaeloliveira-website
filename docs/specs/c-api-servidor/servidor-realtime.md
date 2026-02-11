# Server & Real-time

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Spec que define padrões de server-side no Core Stack: Server Actions com validação Zod, API Routes (Route Handlers) REST, Middleware para auth/redirects/headers, guia de decisão Server vs Client Components, estratégias de ISR e revalidação, cache (fetch, route, router), e real-time via WebSocket, SSE e polling como fallback.

## Motivacao

Next.js 16 oferece Server Components, Server Actions e Route Handlers como pilares. Projetos precisam de padrões claros para escolher quando usar cada abordagem, evitar over-fetching e manter UX fluida. ISR e cache reduzem carga no servidor e melhoram TTFB. Real-time (notificações, presence, live updates) e comum em dashboards e SaaS; WebSocket, SSE e polling devem coexistir com fallbacks definidos.

## Requisitos Funcionais

- **RF01:** Server Actions para mutações (create, update, delete) com validação Zod
- **RF02:** API Routes (Route Handlers) para endpoints REST públicos ou internos
- **RF03:** Middleware para verificação de auth, redirects condicionais e headers de segurança
- **RF04:** Guia de decisão (fluxograma ou tabela) Server vs Client Components
- **RF05:** Padrões ISR com `revalidate` (time-based e on-demand)
- **RF06:** Estratégias de cache documentadas (fetch cache, full route cache, router cache)
- **RF07:** WebSocket client com reconexão automática e heartbeat
- **RF08:** Suporte a Server-Sent Events (SSE) para streaming unidirecional
- **RF09:** Polling como fallback quando WebSocket/SSE indisponíveis
- **RF10:** Padrões de real-time: live updates, notificações, presence (who's online)

## Requisitos Nao-Funcionais

- **RNF01:** Validação obrigatória em Server Actions via Zod
- **RNF02:** Middleware deve ser enxuto (evitar lógica pesada)
- **RNF03:** WebSocket com reconexão exponencial e limite de tentativas

## Design da API / Interface

### Server Action com Zod

```ts
// src/app/actions/users.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
});

export async function createUser(prevState: unknown, formData: FormData) {
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    return {
      success: false,
      errors: Object.fromEntries(
        Object.entries(tree.properties ?? {}).map(([key, value]) => [
          key,
          value?.errors ?? [],
        ]),
      ),
    };
  }

  // `db` representa a camada de acesso a dados (ex: Prisma, Drizzle, ou qualquer ORM).
  // A configuracao do ORM nao faz parte desta spec; usar como interface generica.
  const user = await db.users.create(parsed.data);
  revalidatePath("/users");
  return { success: true, id: user.id };
}
```

### Uso em formulario (Client)

```tsx
// src/components/user-form.tsx
"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/users";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" placeholder="Nome" disabled={isPending} />
      <input
        name="email"
        type="email"
        placeholder="Email"
        disabled={isPending}
      />
      {state?.errors && (
        <ul>
          {Object.entries(state.errors).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ul>
      )}
      <button type="submit" disabled={isPending}>
        Criar
      </button>
    </form>
  );
}
```

### API Route (Route Handler)

```ts
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  // `db` representa a camada de acesso a dados (ex: Prisma, Drizzle, ou qualquer ORM).
  // A configuracao do ORM nao faz parte desta spec; usar como interface generica.
  const users = await db.users.findMany({
    skip: (parsed.data.page - 1) * parsed.data.limit,
    take: parsed.data.limit,
  });
  return NextResponse.json(users);
}
```

### Middleware patterns

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const requiresAuth = request.nextUrl.pathname.startsWith("/dashboard");

  if (requiresAuth && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/login"] };
```

### ISR e Revalidation

```tsx
// Page com revalidate por tempo
export const revalidate = 60; // segundos

export default async function ProductsPage() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    next: { revalidate: 3600 },
  });
  const products: Product[] = await res.json();

  return <ProductList products={products} />;
}
```

```ts
// Revalidation on-demand (route handler)
// src/app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { path } = await request.json();
  if (typeof path === "string") {
    revalidatePath(path);
    return NextResponse.json({ revalidated: path });
  }
  return NextResponse.json({ error: "path required" }, { status: 400 });
}
```

### Guia Server vs Client

| Criterio                            | Server | Client |
| ----------------------------------- | ------ | ------ |
| Acesso a dados sensiveis            | Sim    | Nao    |
| Interatividade (onClick, useState)  | Nao    | Sim    |
| Browser APIs (localStorage, window) | Nao    | Sim    |
| SEO / Conteudo estatico             | Sim    | Nao    |
| Real-time (WebSocket, polling)      | Nao    | Sim    |

### WebSocket com reconexao

```ts
// src/lib/realtime/use-web-socket.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);
      ws.current.onopen = () => {
        retryCount.current = 0;
        setIsConnected(true);
      };
      ws.current.onclose = () => {
        setIsConnected(false);
        if (retryCount.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
          retryCount.current++;
          setTimeout(connect, delay);
        }
      };
    };
    connect();
    return () => ws.current?.close();
  }, [url]);

  return { ws: ws.current, isConnected };
}
```

### SSE client hook

```tsx
// src/lib/realtime/use-sse.ts
"use client";

import { useEffect, useState } from "react";

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSource.onmessage = (e) => setData(JSON.parse(e.data));
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [url]);

  return data;
}
```

### Polling fallback

```tsx
// src/lib/realtime/use-polling.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export function usePolling<T>(url: string, intervalMs = 5000) {
  return useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then((r) => r.json()) as Promise<T>,
    refetchInterval: intervalMs,
  });
}
```

## Estrutura de Arquivos

```
src/
├── app/
│   ├── actions/           # Server Actions
│   │   └── users.ts
│   ├── api/
│   │   ├── users/
│   │   │   └── route.ts
│   │   └── revalidate/
│   │       └── route.ts
│   └── (dashboard)/
│       └── page.tsx       # ISR page
├── middleware.ts
├── lib/
│   └── realtime/
│       ├── use-web-socket.ts
│       ├── use-sse.ts
│       ├── use-polling.ts
│       └── index.ts
└── docs/
    └── specs/
        └── server/
            └── server-realtime.md
```

## Dependencias

### Bibliotecas Externas

- `zod` - validacao em Server Actions e API Routes
- `@tanstack/react-query` (v5) - polling fallback via useQuery
- Nenhuma lib adicional para WebSocket/SSE (APIs nativas)

### Specs Relacionados

- [Formularios](../b-dados-formularios/formularios.md) - useActionState e integracao com forms
- [API Client & Errors](./cliente-api-erros.md) - chamadas a APIs externas
- [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md) - middleware de auth
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) - headers de seguranca

## Notas de Implementacao

- **Middleware de autenticacao** e definido na spec de [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md) como spec "dona". Os exemplos de middleware nesta spec sao para patterns genericos (headers, logging, redirects). Para auth, referenciar a spec de auth.
- `@tanstack/react-query` e uma dependencia compartilhada com a spec de [Cliente API & Erros](./cliente-api-erros.md), que define a configuracao do QueryClient.
- `db` nos exemplos de Server Actions representa qualquer ORM (Prisma, Drizzle, etc.) - a escolha do ORM fica a criterio de cada projeto que usar este template.

## Criterios de Aceite

- [ ] Server Actions com Zod em todas as mutacoes
- [ ] Route Handlers para REST documentados
- [ ] Middleware com auth check e redirects
- [ ] Guia Server vs Client Components documentado
- [ ] Exemplo ISR com revalidate time-based e on-demand
- [ ] Documentacao de cache (fetch, route, router)
- [ ] Hook useWebSocket com reconexao
- [ ] Hook useSSE para streaming
- [ ] Hook usePolling como fallback
- [ ] Exemplo de presence ou notificacoes em tempo real
- [ ] Testes para Server Actions e API Routes
- [ ] Documentacao no README ou spec

## Referencias

- [Server Actions - Next.js](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Route Handlers - Next.js](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Middleware - Next.js](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Caching - Next.js](https://nextjs.org/docs/app/building-your-application/caching)
- [Server-Sent Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
