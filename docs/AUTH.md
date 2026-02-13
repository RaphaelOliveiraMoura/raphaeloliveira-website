# Fluxo de Autenticacao

Documentacao completa do sistema de autenticacao do Core Stack, cobrindo o fluxo ponta a ponta entre frontend (Next.js) e backend (Fastify).

---

## Visao Geral

O sistema usa **JWT access token** (curto, 15min) + **refresh token** (longo, 7d) em cookie httpOnly. O access token vive apenas em memoria JavaScript (nunca persiste em storage). O refresh token e gerenciado pelo backend via cookie seguro.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│                                                                 │
│  AuthProvider ─── tokenManager (in-memory access token)         │
│       │                                                         │
│       ├── login/register/social → fetch("/api/auth/*")          │
│       ├── checkSession → refresh + /me                          │
│       └── apiClient interceptors → Bearer token + 401 retry     │
│                                                                 │
│  RequireAuth (guard client-side) ── useAuth()                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
   Auth operations (cookies)     Data operations (Bearer)
            │                             │
   fetch("/api/auth/*")          apiClient.get/post(...)
            │                             │
   ┌────────┴─────────┐                  │
   │  Next.js Server   │                  │
   │  /api/auth/*      │                  │
   │  proxyToBackend() │                  │
   └────────┬──────────┘                  │
            │                             │
            └──────────────┬──────────────┘
                           │
              ┌────────────┴────────────┐
              │    Fastify (porta 3001) │
              │    JWT + refresh_tokens │
              │    PostgreSQL           │
              └─────────────────────────┘
```

---

## Dois Canais HTTP (intencional)

O frontend usa **dois canais** distintos para se comunicar com o backend:

### 1. Auth operations — same-origin proxy

Chamadas de autenticacao (login, register, logout, refresh, me, social) passam por API Routes do Next.js (`/api/auth/*`) que fazem proxy para o Fastify via `proxyToBackend()` (`src/app/api/backend-proxy.ts`).

**Por que?** Cookies httpOnly (como o `refresh-token`) so sao enviados automaticamente pelo browser em requests same-origin. Se o frontend chamasse o Fastify diretamente (outra porta), o cookie nao seria incluido.

**Fluxo:**

```
Browser → fetch("/api/auth/login") → Next.js API Route → proxyToBackend() → Fastify
                                                                              │
Browser ← Set-Cookie: refresh-token ← Next.js repassa headers ←──────────────┘
```

### 2. Data operations — direto ao backend

Todas as demais chamadas de API (CRUD, dados, etc.) usam o `apiClient` (`src/lib/api/client.ts`) configurado com `NEXT_PUBLIC_API_URL`, que aponta diretamente para o Fastify.

**Por que?** Nao precisam de cookies — usam `Authorization: Bearer <token>` injetado automaticamente pelo auth interceptor. Mais performatico por nao passar pelo proxy.

---

## Componentes do Sistema

### tokenManager (`src/lib/auth/token.ts`)

Gerenciador de access token **in-memory** (variavel JS). Nunca persiste em localStorage/sessionStorage.

- `set(token)` — armazena e agenda refresh proativo
- `get()` — retorna o token atual
- `clear()` — limpa token e cancela timer
- `isExpired(token)` — verifica expiracao via payload JWT decodificado (sem verificar assinatura)
- `setRefreshHandler(fn)` — registra funcao de refresh para auto-refresh **60 segundos antes** da expiracao

**Consequencia:** ao abrir nova aba ou dar F5, o token em memoria e perdido. O `AuthProvider` re-obtem via refresh cookie automaticamente.

### AuthProvider (`src/providers/auth-provider.tsx`)

Context provider que gerencia todo o estado de autenticacao. Fica no layout raiz `src/app/[locale]/layout.tsx` (instancia unica para todos os route groups).

**No mount:**

1. Configura auth interceptors no `apiClient` (idempotente — so adiciona uma vez)
2. Registra refresh handler no `tokenManager`
3. Executa `checkSession()`:
   - Se nao tem token em memoria ou esta expirado → tenta refresh via cookie
   - Se refresh sucede → busca `/api/auth/me` para obter dados do usuario
   - Se falha → `isAuthenticated = false`

**Funcoes expostas via `useAuth()`:**

- `login(email, password)` — POST `/api/auth/login`
- `register(name, email, password)` — POST `/api/auth/register`
- `socialLogin(idToken, provider)` — POST `/api/auth/social`
- `logout()` — POST `/api/auth/logout` + limpa token + limpa user
- `user`, `isAuthenticated`, `isLoading`

### auth-interceptor (`src/lib/api/auth-interceptor.ts`)

Conecta o `apiClient` ao sistema de auth:

- **Request interceptor:** injeta `Authorization: Bearer <token>` em toda request do `apiClient`
- **refreshWithMutex():** garante que apenas UM refresh roda por vez (mutex). Se multiplas requests recebem 401 simultaneamente, todas aguardam o mesmo refresh
- **setupAuthInterceptors():** idempotente a nivel do modulo (flag `interceptorsConfigured`). Pode ser chamado multiplas vezes sem duplicar interceptors

### apiClient (`src/lib/api/client.ts`)

Ao receber resposta 401:

1. Chama `refreshWithMutex()` (tenta renovar o token)
2. Se sucede → re-executa a request original com o novo token
3. Se falha → chama `notifyRefreshFailure()` (limpa sessao) e lanca `ApiError 401`

---

## Camadas de Protecao de Rotas

A protecao funciona em **duas camadas complementares**:

### Camada 1: Proxy server-side (`src/proxy.ts`)

O proxy do Next.js 16 (antigo `middleware.ts`) roda antes de qualquer pagina carregar. Executa:

1. **i18n middleware** — routing de locales
2. **Security headers** — CSP, HSTS, etc.
3. **Auth guard** (`src/lib/auth/middleware.ts`) — verifica **existencia** do cookie `refresh-token`:
   - Rota protegida (`/dashboard/*`, `/settings/*`) sem cookie → redirect para `/login?callbackUrl=...`
   - Pagina `/login` com cookie → redirect para `/dashboard`

**Limitacao:** o proxy so verifica se o cookie **existe**, nao se e valido. Um cookie expirado/revogado passa pelo proxy mas falha na verificacao do `AuthProvider`.

### Camada 2: RequireAuth client-side (`src/components/auth/require-auth.tsx`)

Guard client-side que usa `useAuth()` para verificar autenticacao real (token valido + usuario carregado):

1. Enquanto `isLoading` → mostra spinner
2. Se `!isAuthenticated` → chama `/api/auth/logout` (limpa o cookie) → redirect para `/login`

**Por que chama logout antes de redirecionar?** Para evitar **loop de redirect** com o proxy:

- Sem o logout: RequireAuth redireciona para `/login` → proxy ve o cookie (expirado mas existente) → redireciona de volta para `/dashboard` → RequireAuth redireciona para `/login` → loop infinito
- Com o logout: RequireAuth limpa o cookie → redireciona para `/login` → proxy nao ve cookie → mostra o login

### callbackUrl e navegacao locale-aware

O `callbackUrl` (para retornar o usuario a pagina original apos login) e sempre armazenado **sem prefixo de locale** (ex: `/dashboard`, nao `/en/dashboard`). Isso porque o `router.push()` de `@/lib/i18n` (next-intl) e locale-aware e adiciona o prefixo automaticamente.

**Fontes de callbackUrl:**

- `RequireAuth` usa `usePathname()` de `@/lib/i18n` (retorna path sem locale)
- Auth middleware usa pathname ja tratado por `stripLocale()`

**Destinos (login/register):** aplicam `stripLocalePrefix()` como defesa adicional antes de `router.push(callbackUrl)`.

Regra geral: **nunca passar paths com prefixo de locale para `router.push()` de `@/lib/i18n`**.

---

## Fluxo Detalhado: Login

```
1. Usuario acessa /dashboard (protegida)
2. Proxy: sem cookie → redirect para /login?callbackUrl=/dashboard
3. Login page: usuario preenche email/password
4. handleSubmit() → useAuth().login(email, password)
5. AuthProvider.login():
   a. fetch("/api/auth/login", { body, credentials: "include" })
   b. Next.js API Route → proxyToBackend() → Fastify POST /auth/login
   c. Fastify: verifica credenciais, gera JWT + refresh token UUID
   d. Resposta: { accessToken, user } + Set-Cookie: refresh-token (httpOnly)
   e. proxyToBackend repassa Set-Cookie para o browser
   f. AuthProvider: tokenManager.set(accessToken), setUser(user)
6. router.push(callbackUrl) → /dashboard (com locale automatico)
7. Dashboard carrega, RequireAuth ve isAuthenticated=true → renderiza
```

## Fluxo Detalhado: Refresh Automatico

```
1. tokenManager detecta: faltam 60s para o token expirar
2. tokenManager._doRefresh() → AuthProvider.refreshAccessToken()
3. fetch("/api/auth/refresh", { credentials: "include" })
4. Next.js → proxyToBackend() → Fastify POST /auth/refresh
5. Fastify:
   a. Le refresh token do cookie
   b. Busca no banco (nao revogado, nao expirado)
   c. Revoga o token atual (rotation)
   d. Gera novo access token + novo refresh token
   e. Retorna { accessToken } + Set-Cookie com novo refresh token
6. AuthProvider: tokenManager.set(novoAccessToken)
7. tokenManager agenda proximo refresh (60s antes da nova expiracao)
```

## Fluxo Detalhado: 401 em chamada de dados

```
1. apiClient.get("/users") → Fastify retorna 401 (token expirado)
2. apiClient detecta 401 → chama refreshWithMutex()
3. refreshWithMutex():
   a. Se ja tem refresh em andamento → retorna o mesmo Promise (mutex)
   b. Senao → chama AuthProvider.refreshAccessToken()
4. Se refresh sucede:
   a. Re-executa GET /users com novo token
   b. Retorna resultado normalmente
5. Se refresh falha:
   a. notifyRefreshFailure() → tokenManager.clear() + setUser(null)
   b. RequireAuth detecta !isAuthenticated → redirect para /login
```

## Fluxo Detalhado: Social Login (Firebase)

```
1. Usuario clica "Login com Google"
2. handleSocialLogin("google")
3. signInWithSocialProvider("google"):
   a. Firebase Auth: popup de autenticacao Google
   b. Retorna idToken do Firebase
4. useAuth().socialLogin(idToken, "google")
5. AuthProvider.socialLogin():
   a. fetch("/api/auth/social", { body: { idToken, provider } })
   b. Fastify POST /auth/social:
      - Verifica idToken com Firebase Admin SDK
      - Cria/atualiza usuario no banco
      - Gera JWT + refresh token
   c. Resposta: { accessToken, user } + Set-Cookie
6. router.push(callbackUrl)
```

---

## Backend: Endpoints de Auth

| Metodo | Path                      | Auth   | Descricao                            |
| ------ | ------------------------- | ------ | ------------------------------------ |
| POST   | `/auth/login`             | Nao    | Login com email/password             |
| POST   | `/auth/register`          | Nao    | Registro + auto-login                |
| POST   | `/auth/refresh`           | Cookie | Renovar access token                 |
| POST   | `/auth/logout`            | Nao    | Revogar refresh token, limpar cookie |
| GET    | `/auth/me`                | Bearer | Dados do usuario autenticado         |
| POST   | `/auth/forgot-password`   | Nao    | Solicitar reset de senha             |
| POST   | `/auth/reset-password`    | Nao    | Resetar senha com token              |
| POST   | `/auth/send-verification` | Bearer | Enviar email de verificacao          |
| POST   | `/auth/verify-email`      | Nao    | Verificar email com token            |
| POST   | `/auth/social`            | Nao    | Login via Firebase (Google/GitHub)   |

### Seguranca do Backend

- **Lockout:** apos 5 tentativas falhas de login, conta e bloqueada temporariamente
- **Token rotation:** cada refresh revoga o token anterior (protege contra replay)
- **Refresh token no banco:** UUID armazenado na tabela `refresh_tokens` (com `revoked`, `expiresAt`)
- **Cookie seguro:** `httpOnly`, `secure` (em producao), `sameSite: lax`, `path: /`

---

## Variaveis de Ambiente Relevantes

| Variavel                 | Onde    | Descricao                               |
| ------------------------ | ------- | --------------------------------------- |
| `API_INTERNAL_URL`       | Server  | URL do Fastify para o proxy Next.js     |
| `NEXT_PUBLIC_API_URL`    | Client  | URL do Fastify para o apiClient         |
| `JWT_SECRET`             | Backend | Chave secreta para assinar JWTs         |
| `JWT_ACCESS_EXPIRATION`  | Backend | Tempo de vida do access token (ex: 15m) |
| `JWT_REFRESH_EXPIRATION` | Backend | Tempo de vida do refresh token (ex: 7d) |
| `NEXT_PUBLIC_FIREBASE_*` | Client  | Config Firebase para social login       |

---

## Arquivos-Chave

| Arquivo                                | Responsabilidade                                             |
| -------------------------------------- | ------------------------------------------------------------ |
| `src/proxy.ts`                         | Proxy Next.js 16 (i18n + headers + auth guard)               |
| `src/lib/auth/middleware.ts`           | Logica do auth guard (cookie check + redirect)               |
| `src/lib/auth/token.ts`                | tokenManager (access token in-memory + auto-refresh)         |
| `src/lib/api/auth-interceptor.ts`      | Interceptors do apiClient (Bearer injection + refresh mutex) |
| `src/lib/api/client.ts`                | apiClient com retry de 401                                   |
| `src/providers/auth-provider.tsx`      | AuthProvider (context + session check + login/logout)        |
| `src/components/auth/require-auth.tsx` | Guard client-side (redirect + logout para evitar loop)       |
| `src/app/api/backend-proxy.ts`         | `proxyToBackend()` (encaminha requests para Fastify)         |
| `src/app/api/auth/*/route.ts`          | 9 API Routes que usam proxyToBackend                         |
| `src/lib/auth/firebase.ts`             | Init do Firebase Auth (social login)                         |
| `src/lib/auth/social-login.ts`         | Popup de social login via Firebase                           |
| `src/types/auth.ts`                    | Tipos: User, Role, Permission, AuthTokenResponse, etc.       |
| `backend/src/modules/auth/`            | Modulo de auth do Fastify (routes, service, schemas)         |
