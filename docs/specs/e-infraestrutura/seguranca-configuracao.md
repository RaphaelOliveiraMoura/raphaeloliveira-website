# Seguranca & Configuracao

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Especificacao de seguranca e configuracao de ambiente para o Core Stack. Cobre prevencao XSS (sanitizacao com DOMPurify), padroes de protecao CSRF, headers de seguranca via Content Security Policy (CSP) e outros (X-Frame-Options, X-Content-Type-Options), rate limiting no client-side, variaveis de ambiente tipadas com t3-env ou Zod, validacao em build-time, separacao server/client e estrutura/convencoes de arquivos .env.

## Motivacao

Aplicacoes web estao expostas a XSS, CSRF e outros vetores de ataque. Headers de seguranca incorretos ou ausentes aumentam riscos. Variaveis de ambiente nao tipadas e sem validacao causam erros em runtime. O Core Stack deve fornecer uma base segura e previsivel para projetos em producao.

## Requisitos Funcionais

- **RF01:** Prevencao XSS - sanitizacao de HTML com DOMPurify (ou similar) antes de renderizar
- **RF02:** Padroes de protecao CSRF (tokens em forms, SameSite cookies)
- **RF03:** Content Security Policy (CSP) configurada via headers no middleware
- **RF04:** Headers seguros: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **RF05:** Rate limiting / throttling no client para acoes criticas (login, envio de forms)
- **RF06:** Schema de env vars com t3-env ou Zod
- **RF07:** Validacao de env vars em build-time (fail fast)
- **RF08:** Separacao clara entre variaveis server-only e client-exposed
- **RF09:** Estrutura e convencoes para arquivos .env

## Requisitos Nao-Funcionais

- **RNF01:** TypeScript - env vars tipadas, sem process.env direto no codigo
- **RNF02:** Nenhuma env sensivel exposta ao client
- **RNF03:** CSP nao quebrar funcionalidade de analytics/recaptcha quando usados

## Design da API / Interface

### Schema de Env com Zod

```ts
// src/config/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    NEXTAUTH_SECRET: z.string().min(32).optional(),
    NEXTAUTH_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
```

```ts
// Uso - server component ou API route
import { env } from '@/config/env';

export async function getData() {
  const db = connect(env.DATABASE_URL); // tipado e validado
  // ...
}
```

```tsx
// Uso - client component
'use client';

import { env } from '@/config/env';

export function ApiLink() {
  return <a href={env.NEXT_PUBLIC_API_URL}>API</a>;
}
```

### Estrutura .env

```
# .env.local (gitignored) - valores reais
# .env.example - template sem valores sensiveis

# Server-only (nunca expor ao client)
DATABASE_URL=
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Client (prefixo NEXT_PUBLIC_)
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_API_URL=
```

### Sanitizacao XSS com DOMPurify

Opcional: `jsdom` e necessario apenas se `DOMPurify` for usado em Server Components. Para uso apenas no client, `isomorphic-dompurify` nao precisa de `jsdom`.

```ts
// src/lib/security/sanitize.ts
import DOMPurify from 'dompurify';

export type SanitizeOptions = {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
};

const DEFAULT_OPTIONS: SanitizeOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes: { a: ['href', 'title', 'target'] },
};

export function sanitizeHtml(dirty: string, options?: SanitizeOptions): string {
  if (typeof window === 'undefined') {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('');
    const purify = DOMPurify(dom.window as unknown as Window);
    return purify.sanitize(dirty, { ...DEFAULT_OPTIONS, ...options });
  }
  return DOMPurify.sanitize(dirty, { ...DEFAULT_OPTIONS, ...options });
}
```

```tsx
// Uso em componente - conteudo de terceiros
'use client';

import { sanitizeHtml } from '@/lib/security/sanitize';

export function UserBio({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
```

### Headers de Seguranca no Middleware

- **Desenvolvimento:** CSP relaxada com `'unsafe-inline'` e `'unsafe-eval'` para compatibilidade com hot reload e DevTools.
- **Producao:** Remover `'unsafe-inline'` e usar nonces para scripts inline. Remover `'unsafe-eval'`. Configurar `report-uri` para monitorar violacoes.

Exemplo de CSP para producao:

```tsx
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
`
```

```ts
// src/lib/security/headers.ts
export function getSecurityHeaders(): Record<string, string> {
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self'", // Em producao, usar nonces para scripts inline
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL}`,
    "frame-ancestors 'none'",
  ].join('; ');

  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': csp,
  };
}
```

```ts
// src/middleware.ts - adicionar headers
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSecurityHeaders } from '@/lib/security/headers';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
```

### Padroes CSRF

```ts
// Server Action com verificacao de origin (Next.js faz parte do trabalho)
// Para forms tradicionais: token CSRF em hidden input
// src/lib/security/csrf.ts

import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  const hashed = createHash('sha256').update(token).digest('hex');
  cookieStore.set('csrf_token', hashed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600,
  });
  return token;
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get('csrf_token')?.value;
  if (!stored) return false;
  const hashed = createHash('sha256').update(token).digest('hex');
  return hashed === stored;
}
```

### Rate Limiting no Client

```ts
// src/lib/security/rateLimit.ts
import { toast } from "sonner"

export function createClientRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];

  return function canProceed(): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    const recent = requests.filter((t) => t > windowStart);
    if (recent.length >= maxRequests) return false;
    recent.push(now);
    requests.length = 0;
    requests.push(...recent);
    return true;
  };
}

// Uso: limitar 5 tentativas de login por minuto
const loginLimiter = createClientRateLimiter(5, 60_000);

async function handleLogin() {
  if (!loginLimiter()) {
    toast.error('Muitas tentativas. Tente novamente em 1 minuto.');
    return;
  }
  // ...
}
```

```tsx
// Hook useThrottle para acoes genericas
// src/hooks/useThrottle.ts
import { useRef, useCallback } from "react"

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): T {
  const lastCall = useRef(0);
  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      if (now - lastCall.current >= delayMs) {
        lastCall.current = now;
        return fn(...args);
      }
    }) as T,
    [fn, delayMs]
  );
}
```

## Estrutura de Arquivos

```
src/
├── config/
│   └── env.ts                  # Schema t3-env + Zod
├── lib/
│   └── security/
│       ├── sanitize.ts         # sanitizeHtml
│       ├── headers.ts          # getSecurityHeaders
│       ├── csrf.ts             # generate/validate CSRF token
│       ├── rateLimit.ts       # client rate limiter
│       └── index.ts
├── hooks/
│   └── useThrottle.ts
├── middleware.ts               # aplica security headers
.env.example                    # template
```

## Dependencias

### Bibliotecas Externas

- `@t3-oss/env-nextjs` - validacao e tipagem de env para Next.js
- `zod` - schema validation
- `dompurify` - sanitizacao XSS
- `isomorphic-dompurify` ou `jsdom` (opcional) - para sanitize no server. `jsdom` so e necessario se `DOMPurify` for usado em Server Components.

### Specs Relacionados

- [Autenticacao & Autorizacao](../e-infraestrutura/autenticacao-autorizacao.md) - cookies httpOnly, tokens
- [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) - interceptors, CORS

## Criterios de Aceite

- [ ] Schema env com t3-env ou Zod definido
- [ ] Validacao em build-time (env invalida falha o build)
- [ ] .env.example documentando todas as variaveis
- [ ] Separacao server/client respeitada (NEXT_PUBLIC_)
- [ ] sanitizeHtml implementado e usado em exemplo de risco XSS
- [ ] Headers de seguranca aplicados no middleware
- [ ] CSP configurada (ajustavel para analytics se necessario)
- [ ] Padroes CSRF documentados (e/ou implementados para forms criticos)
- [ ] Rate limiter ou useThrottle para acoes sensiveis
- [ ] Documentacao de como ajustar CSP e env para novos projetos

## Referencias

- [t3-env](https://env.t3.gg/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Content Security Policy - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Cheat Sheet - Security Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
