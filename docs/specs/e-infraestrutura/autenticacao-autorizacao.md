# Autenticacao & Autorizacao

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de autenticacao e autorizacao para o Core Stack. Cobre fluxo de login/logout, gerenciamento de tokens (access + refresh com rotacao), estrategia de armazenamento (httpOnly cookies vs localStorage), protecao de rotas via Next.js Middleware, gerenciamento de sessao, RBAC (Role-Based Access Control), componente `<Can>` para renderizacao condicional por permissao, hooks `usePermissions()` e `useAuth()`, botoes desabilitados com tooltip por falta de permissao, itens de menu condicionais por role e redirect quando permissao insuficiente.

O Core Stack fornece uma implementacao **custom** de autenticacao baseada em tokens JWT. Para projetos que precisam de OAuth/social login, migrar para `next-auth` (NextAuth.js) que segue a mesma interface de hooks (`useAuth`, `usePermissions`).

## Motivacao

Aplicacoes precisam restringir acesso a recursos e UI conforme perfis de usuario. Sem um sistema de auth/autorization padronizado, logica de verificacao fica espalhada, tokens sao tratados de forma insegura e a experiencia do usuario (feedback, redirects) e inconsistente. O Core Stack deve servir SaaS, dashboards e apps com multiplos roles.

## Requisitos Funcionais

- **RF01:** Fluxo de login (credenciais -> tokens) e logout (invalidacao + redirecionamento)
- **RF02:** Gerenciamento de tokens: access token (curta duracao), refresh token (longa duracao) e rotacao na renovacao
- **RF03:** Access token armazenado em memoria (variavel no AuthProvider). Refresh token em cookie httpOnly (set pelo backend). Essa estrategia combina seguranca (httpOnly) com performance (sem round-trip para ler access token).
- **RF04:** Next.js Middleware para protecao de rotas (redirecionamento para login quando nao autenticado)
- **RF05:** Gerenciamento de sessao (persistencia, expiracao, renovacao automatica)
- **RF06:** RBAC - definicao de roles e permissoes (ex: `admin`, `editor`, `viewer`)
- **RF07:** Componente `<Can>` para renderizacao condicional baseada em permissao
- **RF08:** Hook `usePermissions()` para checagem de permissao em componentes
- **RF09:** Hook `useAuth()` para estado de autenticacao (user, isLoading, isAuthenticated)
- **RF10:** Botoes desabilitados com Tooltip explicando falta de permissao
- **RF11:** Itens de menu condicionais por role
- **RF12:** Redirect para pagina de "acesso negado" quando permissao insuficiente

O refresh de token e feito pelo interceptor do [Cliente API](../c-api-servidor/cliente-api-erros.md) quando recebe 401. O fluxo: interceptor detecta 401 → chama endpoint `/auth/refresh` com cookie httpOnly → recebe novo access token → atualiza AuthProvider → retenta request original.

O nome do cookie de refresh token e `refresh_token`. Projetos podem configurar via variavel de ambiente `AUTH_COOKIE_NAME`.

O parametro de redirect apos login e `callbackUrl` (compativel com NextAuth). Exemplo: `/login?callbackUrl=/dashboard`.

## Requisitos Nao-Funcionais

- **RNF01:** Tokens nunca expostos via JavaScript quando em httpOnly (seguranca)
- **RNF02:** TypeScript - tipos para User, Role, Permission
- **RNF03:** Integracao facil com backend (REST ou BFF) - API client com interceptors para refresh

## Design da API / Interface

### Tipos de Auth e RBAC

```ts
// src/types/auth.ts
export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'products:read'
  | 'products:write'
  | 'settings:read'
  | 'settings:write';

// Mapeamento role -> permissoes
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['users:read', 'users:write', 'users:delete', 'products:read', 'products:write', 'settings:read', 'settings:write'],
  editor: ['users:read', 'products:read', 'products:write'],
  viewer: ['users:read', 'products:read'],
};
```

### Session (Server-side)

```tsx
// src/lib/auth/session.ts
import { cookies } from "next/headers"

export async function getSession(): Promise<User | null> {
  const token = (await cookies()).get("refresh_token")?.value
  if (!token) return null

  try {
    const res = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: { Cookie: `refresh_token=${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
```

### useAuth Hook

```tsx
// src/hooks/use-auth.ts
'use client';

import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  // Implementacao custom: usa AuthProvider context com access token em memoria
  // O AuthProvider gerencia o estado de autenticacao e renovacao de tokens
  const { user, isLoading } = useAuthContext();

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
  };
}
```

### usePermissions Hook

```ts
// src/hooks/use-permissions.ts
'use client';

import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { ROLE_PERMISSIONS, type Permission } from '@/types/auth';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] ?? [];
  }, [user]);

  const can = (permission: Permission): boolean => permissions.includes(permission);

  const canAny = (perms: Permission[]): boolean => perms.some((p) => can(p));
  const canAll = (perms: Permission[]): boolean => perms.every((p) => can(p));

  return { permissions, can, canAny, canAll };
}
```

### Componente Can

```tsx
// src/components/auth/can.tsx
'use client';

import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/types/auth';

interface CanProps {
  permission: Permission | Permission[];
  mode?: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, mode = 'any', fallback = null, children }: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  const allowed =
    Array.isArray(permission)
      ? mode === 'all'
        ? canAll(permission)
        : canAny(permission)
      : can(permission);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
```

### Botao com permissao e tooltip

```tsx
// src/components/auth/permission-button.tsx
'use client';

import { forwardRef } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Permission } from '@/types/auth';

interface PermissionButtonProps
  extends React.ComponentProps<typeof Button> {
  permission: Permission;
  deniedTooltip?: string;
}

export const PermissionButton = forwardRef<
  HTMLButtonElement,
  PermissionButtonProps
>(function PermissionButton(
  { permission, deniedTooltip = 'Você não tem permissão para esta ação', children, ...props },
  ref
) {
  const { can } = usePermissions();
  const hasPermission = can(permission);

  const button = (
    <Button ref={ref} disabled={!hasPermission} {...props}>
      {children}
    </Button>
  );

  if (!hasPermission && deniedTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{deniedTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});
```

### Menu condicional por role

```tsx
// src/components/layouts/sidebar.tsx - exemplo de uso
import { Can } from '@/components/auth/can';

export function Sidebar() {
  return (
    <nav>
      <NavLink href="/dashboard">Dashboard</NavLink>
      <Can permission="users:read">
        <NavLink href="/users">Usuários</NavLink>
      </Can>
      <Can permission="products:read">
        <NavLink href="/products">Produtos</NavLink>
      </Can>
      <Can permission="settings:read">
        <NavLink href="/settings">Configurações</NavLink>
      </Can>
    </nav>
  );
}
```

### Protecao de rotas no Middleware

```ts
// src/middleware.ts (ou integrado ao i18n middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/admin', '/users', '/settings'];
const AUTH_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('refresh_token')?.value;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
```

### Redirect por permissao insuficiente

```tsx
// src/components/auth/require-permission.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/types/auth';

interface RequirePermissionProps {
  permission: Permission | Permission[];
  mode?: 'any' | 'all';
  redirectTo?: string;
  children: React.ReactNode;
}

export function RequirePermission({
  permission,
  mode = 'any',
  redirectTo = '/unauthorized',
  children,
}: RequirePermissionProps) {
  const { can, canAny, canAll } = usePermissions();
  const router = useRouter();

  const allowed =
    Array.isArray(permission)
      ? mode === 'all'
        ? canAll(permission)
        : canAny(permission)
      : can(permission);

  useEffect(() => {
    if (!allowed) router.replace(redirectTo);
  }, [allowed, redirectTo, router]);

  if (!allowed) return null; // ou skeleton/loading
  return <>{children}</>;
}
```

### AuthProvider

```tsx
// src/providers/auth-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

// Implementacao custom com access token em memoria e refresh token em cookie httpOnly.
// Para projetos com OAuth/social login, substituir por NextAuth SessionProvider
// mantendo a mesma interface de hooks (useAuth, usePermissions).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sessao ao montar
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Estrutura de Arquivos

```
src/
├── types/
│   └── auth.ts                 # User, Role, Permission, ROLE_PERMISSIONS
├── lib/
│   └── auth/
│       ├── session.ts          # getSession (server-side)
│       ├── token.ts            # token storage/refresh (server-side)
│       └── index.ts
├── hooks/
│   ├── use-auth.ts
│   └── use-permissions.ts
├── components/
│   └── auth/
│       ├── can.tsx
│       ├── permission-button.tsx
│       ├── require-permission.tsx
│       └── index.ts
├── providers/
│   └── auth-provider.tsx
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── unauthorized/
│   │   └── page.tsx
│   └── (protected)/
│       └── dashboard/
└── middleware.ts               # route protection
```

## Dependencias

### Bibliotecas Externas

- `next-auth` (opcional) - para projetos com OAuth/social login; a implementacao padrao e custom com JWT
- `zustand` (opcional) - para estado global de auth ou react-query para session

### Specs Relacionados

- [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md) - interceptors para refresh token
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) - cookies httpOnly, CSRF
- [Layouts & Responsividade](../a-fundacao-visual/layouts-responsividade.md) - Sidebar com menu condicional

## Notas de Implementacao

- **Middleware de protecao de rotas** e definido nesta spec como implementacao canonica. As specs de [Servidor & Real-time](../c-api-servidor/servidor-realtime.md) e [Navegacao](../d-navegacao/navegacao-url-busca.md) referenciam esta spec para logica de auth.
- **Interceptor de refresh token** e implementado na spec de [Cliente API & Erros](../c-api-servidor/cliente-api-erros.md); esta spec define a estrategia e endpoints.
- O componente `<Can>` e `usePermissions` sao as interfaces de autorizacao na UI. Para protecao server-side, usar `getSession()` em Server Components.

## Criterios de Aceite

- [ ] Tipos User, Role, Permission e ROLE_PERMISSIONS definidos
- [ ] Hook useAuth retornando user, isLoading, isAuthenticated
- [ ] Hook usePermissions com can, canAny, canAll
- [ ] Componente Can funcionando com permission unica e array
- [ ] PermissionButton desabilitando e exibindo tooltip quando sem permissao
- [ ] RequirePermission redirecionando para /unauthorized
- [ ] Middleware protegendo rotas e redirecionando para login
- [ ] Fluxo login/logout implementado
- [ ] Estrategia de token documentada (httpOnly vs memoria)
- [ ] Pagina /unauthorized criada
- [ ] Testes para usePermissions e Can (se aplicavel)

## Referencias

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [next-auth](https://next-auth.js.org/)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [RBAC - NIST](https://csrc.nist.gov/projects/role-based-access-control)
