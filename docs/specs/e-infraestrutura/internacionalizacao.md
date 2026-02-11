# Internacionalizacao

> **Status:** `em-desenvolvimento`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de internacionalizacao (i18n) para o Core Stack utilizando `next-intl` com App Router. Suporta multiplas locales com arquivos de traducao em JSON (namespaces), deteccao automatica via middleware, componente de troca de idioma, formatacao de datas/numeros/moeda por locale, pluralizacao e fallback de locale. Inclui preparacao para RTL e type-safety nas chaves de traducao via TypeScript.

## Motivacao

Projetos que precisam atingir mercados multiplos requerem suporte nativo a idiomas. Sem i18n estruturado, strings ficam espalhadas no codigo, manutencao e dificil e nao ha consistencia na formatacao de valores. O Core Stack serve como base para SaaS globais, e-commerce internacional e landing pages multilíngues.

## Requisitos Funcionais

- **RF01:** Integracao `next-intl` com App Router (layout e routing por locale)
- **RF02:** Estrutura de arquivos de traducao em JSON: um arquivo por namespace por locale (ex: `common.json`, `auth.json`, `errors.json`)
- **RF03:** Middleware para deteccao de locale. Prioridade de deteccao: 1) path prefix (/pt-BR/...), 2) cookie (NEXT_LOCALE), 3) header Accept-Language, 4) locale padrao
- **RF04:** Componente `<LanguageSwitcher>` para troca de idioma via navegacao locale-aware
- **RF05:** Formatacao de data, numero e moeda conforme locale ativo
- **RF06:** Pluralizacao via ICU Message Format (one, few, many, other)
- **RF07:** Fallback para locale padrao quando traducao nao existir
- **RF08:** Preparacao futura para RTL: estrutura de mensagens e componentes nao devem assumir LTR. Implementacao de RTL nao faz parte do escopo atual.
- **RF09:** Type-safety para chaves de traducao via tipagem gerada ou inferida
- **RF10:** Todo texto visivel ao usuario deve usar `useTranslations` (client) ou `getTranslations` (server). Textos hardcoded sao proibidos em componentes — a unica fonte de strings exibidas ao usuario sao os arquivos de traducao em `messages/`
- **RF11:** Imports de i18n devem usar abstracoes centralizadas de `@/lib/i18n`. Import direto de `next-intl` e proibido em componentes e pages
- **RF12:** `t.rich()` com callbacks JSX deve usar tags XML nas mensagens (`<tag>conteudo</tag>`), nunca interpolacao simples (`{variavel}`). Funcoes passadas para interpolacao simples causam erro de runtime em Client Components

## Requisitos Nao-Funcionais

- **RNF01:** TypeScript - chaves de traducao tipadas, sem strings magicas
- **RNF02:** Performance - namespaces carregados sob demanda (lazy loading) quando viavel
- **RNF03:** Sem impacto negativo em Core Web Vitals
- **RNF04:** Fallback gracioso quando locale nao suportado

## Design da API / Interface

### Configuracao next-intl e Routing

```ts
// src/config/i18n.ts
export const locales = ['pt-BR', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt-BR';

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português',
  'en': 'English',
  'es': 'Español',
};
```

```ts
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && routing.locales.includes(requested as "pt-BR" | "en" | "es")
      ? requested
      : routing.defaultLocale;

  return {
    locale,
    messages: {
      common: (await import(`../../messages/${locale}/common.json`)).default,
      auth: (await import(`../../messages/${locale}/auth.json`)).default,
      errors: (await import(`../../messages/${locale}/errors.json`)).default,
    },
  };
});
```

```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@/config/i18n';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // /pt-BR omitido quando for default
});
```

### Middleware de deteccao de locale

```ts
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(pt-BR|en|es)/:path*'],
};
```

### Abstracoes Centralizadas (RF11)

A lib `next-intl` e importada em um **unico arquivo** de abstracao. Todo o app consome apenas as abstracoes. Se a lib mudar no futuro, apenas este arquivo precisa ser alterado.

```ts
// src/lib/i18n/navigation.ts — unico ponto que importa next-intl/navigation
import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

```ts
// src/lib/i18n/index.ts — barrel file, ponto central de import para componentes
export { Link, redirect, usePathname, useRouter } from "./navigation";
export { useDateFormatter, useNumberFormatter } from "./formatters";
export { useLocale, useTranslations, useMessages, useFormatter } from "next-intl";
export { getTranslations, getLocale, getMessages } from "next-intl/server";
```

```tsx
// Uso em componentes — SEMPRE importar de @/lib/i18n
import { useTranslations, Link, useRouter } from "@/lib/i18n";

// NUNCA importar diretamente de next-intl ou next/link em componentes
// import { useTranslations } from "next-intl"; // ERRADO
// import Link from "next/link"; // ERRADO
```

### Estrutura de mensagens com namespaces

```json
// messages/pt-BR/common.json
{
  "welcome": "Bem-vindo",
  "signIn": "Entrar",
  "signOut": "Sair",
  "itemsCount": "{count, plural, =0 {Nenhum item} one {# item} other {# itens}}"
}
```

```tsx
// Uso em componentes — via abstracoes
import { useTranslations } from "@/lib/i18n";

export function Header() {
  const t = useTranslations("common");
  return (
    <header>
      <h1>{t("welcome")}</h1>
      <p>{t("itemsCount", { count: 5 })}</p>
    </header>
  );
}
```

### Componente LanguageSwitcher

```tsx
// src/components/shared/language-switcher.tsx
'use client';

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations, useRouter, usePathname } from "@/lib/i18n";
import { locales, localeNames, type Locale } from "@/config/i18n";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  function handleLocaleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t("language")}>
          <Globe className="mr-2 size-4" />
          {localeNames[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? "font-semibold" : ""}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Formatacao de data, numero e moeda

```tsx
// src/lib/i18n/formatters.ts
import { useFormatter } from 'next-intl';

export function useDateFormatter() {
  const format = useFormatter();
  return {
    date: (d: Date) => format.dateTime(d, { dateStyle: 'medium' }),
    dateTime: (d: Date) => format.dateTime(d, { dateStyle: 'short', timeStyle: 'short' }),
    relative: (d: Date) => format.relativeTime(d),
  };
}

export function useNumberFormatter() {
  const format = useFormatter();
  return {
    currency: (value: number, currency = 'BRL') =>
      format.number(value, { style: 'currency', currency }),
    number: (value: number) => format.number(value),
    percent: (value: number) => format.number(value / 100, { style: 'percent' }),
  };
}
```

```tsx
// Uso em componente — via abstracoes
import { useDateFormatter, useNumberFormatter } from "@/lib/i18n";

export function ProductPrice({ price, date }: { price: number; date: Date }) {
  const { currency } = useNumberFormatter();
  const { date: formatDate } = useDateFormatter();
  return (
    <div>
      <span>{currency(price)}</span>
      <time>{formatDate(date)}</time>
    </div>
  );
}
```

### Type-safety para chaves de traducao

```ts
// src/types/i18n.ts
import common from "../../messages/pt-BR/common.json";
import auth from "../../messages/pt-BR/auth.json";
import errors from "../../messages/pt-BR/errors.json";

type Messages = {
  common: typeof common;
  auth: typeof auth;
  errors: typeof errors;
};

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
```

### Preparacao RTL (futuro)

```tsx
// src/app/[locale]/layout.tsx
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = ['ar', 'he', 'fa'].includes(locale);
  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

## Estrutura de Arquivos

```
src/
├── config/
│   └── i18n.ts                 # locales, defaultLocale, localeNames
├── i18n/
│   ├── request.ts              # getRequestConfig (carrega todos os namespaces)
│   ├── routing.ts              # defineRouting
│   └── index.ts                # barrel export (routing)
├── lib/
│   └── i18n/
│       ├── navigation.ts       # abstracoes de navegacao (Link, useRouter, usePathname, redirect)
│       ├── formatters.ts       # useDateFormatter, useNumberFormatter
│       └── index.ts            # barrel: re-exporta navigation + formatters + hooks next-intl
├── types/
│   └── i18n.ts                 # declare module next-intl { AppConfig { Messages } }
├── messages/
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── errors.json
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── errors.json
│   └── es/
│       ├── common.json
│       ├── auth.json
│       └── errors.json
├── components/
│   └── shared/
│       └── language-switcher.tsx
├── middleware.ts               # next-intl middleware + security headers
└── app/
    ├── layout.tsx              # root layout (passthrough, sem html/body)
    └── [locale]/
        └── layout.tsx          # locale layout (html lang={locale}, body, providers)
```

## Dependencias

### Bibliotecas Externas

- `next-intl` - i18n para Next.js App Router com suporte a namespaces, pluralizacao e formatacao

### Specs Relacionados

- [Formatadores & Date/Time](../b-dados-formularios/formatadores-datetime.md) - integracao com formatacao de datas
- [Design System](../a-fundacao-visual/design-system.md) - estilo do LanguageSwitcher
- [Layouts & Responsividade](../a-fundacao-visual/layouts-responsividade.md) - posicionamento do switcher na navbar

## Notas de Implementacao

- Os formatadores de data/numero/moeda desta spec sao **wrappers locale-aware** sobre `Intl` APIs. A spec de [Formatadores & Date/Time](../b-dados-formularios/formatadores-datetime.md) fornece funcoes puras que aceitam locale como parametro. Quando ambos existem, preferir os formatadores do i18n em componentes (usam locale do contexto) e os formatadores puros em utilidades/server-side.
- A lib `next-intl` e importada exclusivamente em `src/lib/i18n/` (camada de abstracao), `src/i18n/` (configuracao) e `src/app/[locale]/layout.tsx` (setup do provider). Componentes e pages **nunca** importam de `next-intl` diretamente.
- O root layout (`src/app/layout.tsx`) e um passthrough que retorna apenas `children`. O `[locale]/layout.tsx` e o layout real com `<html lang={locale}>`, `<body>`, fonts e providers.

### Como adicionar um novo idioma

1. Adicionar o locale em `src/config/i18n.ts` (array `locales` e mapa `localeNames`)
2. Criar a pasta `messages/{novo-locale}/` com todos os namespaces (`common.json`, `auth.json`, `errors.json`)
3. Atualizar o cast em `src/i18n/request.ts` para incluir o novo locale
4. Atualizar o matcher em `src/middleware.ts` para incluir o path prefix
5. Atualizar a tipagem em `src/types/i18n.ts` se necessario

### Como adicionar um novo namespace

1. Criar `messages/{locale}/novo-namespace.json` para todos os locales
2. Importar e mesclar em `src/i18n/request.ts`
3. Atualizar a tipagem em `src/types/i18n.ts`

## Criterios de Aceite

- [x] next-intl configurado com App Router e routing por locale
- [x] Middleware detectando locale via cookie, header ou path
- [x] Pelo menos 2 namespaces de traducao (common, auth, errors)
- [x] Componente LanguageSwitcher funcional com navegacao locale-aware
- [x] Formatacao de data, numero e moeda por locale implementada
- [x] Pluralizacao via ICU Message Format em ao menos um caso
- [x] Fallback para defaultLocale quando chave ou locale inexistente
- [x] Tipagem de chaves de traducao via `declare module "next-intl"` (TypeScript)
- [x] Documentacao de como adicionar novo idioma e namespace
- [ ] Testes unitarios para formatters e switcher (se aplicavel)
- [x] Abstracoes centralizadas em `@/lib/i18n` (RF11)
- [x] Todos os componentes usando `useTranslations` em vez de textos hardcoded (RF10)
- [x] Rich text usa tags XML nas mensagens, nao interpolacao simples (RF12)

## Referencias

- [next-intl - App Router](https://next-intl-docs.vercel.app/docs/usage/configuration)
- [next-intl - Routing](https://next-intl-docs.vercel.app/docs/routing)
- [next-intl - Navigation](https://next-intl-docs.vercel.app/docs/routing/navigation)
- [ICU Message Format - Pluralization](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Intl.DateTimeFormat - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [HTML dir attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
