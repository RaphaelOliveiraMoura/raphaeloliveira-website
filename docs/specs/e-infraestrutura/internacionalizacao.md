# Internacionalizacao

> **Status:** `concluido`
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
- **RF04:** Componente `<LanguageSwitcher>` para troca de idioma com persistencia em cookie
- **RF05:** Formatacao de data, numero e moeda conforme locale ativo
- **RF06:** Pluralizacao via ICU Message Format (one, few, many, other)
- **RF07:** Fallback para locale padrao quando traducao nao existir
- **RF08:** Preparacao futura para RTL: estrutura de mensagens e componentes nao devem assumir LTR. Implementacao de RTL nao faz parte do escopo atual.
- **RF09:** Type-safety para chaves de traducao via tipagem gerada ou inferida

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
import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as "pt-BR" | "en")) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: {
      ...(await import(`../../messages/${locale}/common.json`)).default,
      ...(await import(`../../messages/${locale}/auth.json`)).default,
      ...(await import(`../../messages/${locale}/errors.json`)).default,
    },
  }
})
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
// Uso em componentes
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('common');
  return (
    <header>
      <h1>{t('welcome')}</h1>
      <p>{t('itemsCount', { count: 5 })}</p>
    </header>
  );
}
```

### Componente LanguageSwitcher

```tsx
// src/components/shared/language-switcher.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { locales, localeNames, type Locale } from '@/config/i18n';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {localeNames[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? 'font-semibold' : ''}
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
    relative: (d: Date) => format.relativeTime(d, 'second'),
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
// Uso em componente
'use client';

import { useDateFormatter, useNumberFormatter } from '@/lib/i18n/formatters';

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
// src/types/i18n.ts - Tipagem para namespaces (opcional: gerar via script)
export type CommonKeys = keyof typeof import('../../messages/pt-BR/common.json');
export type AuthKeys = keyof typeof import('../../messages/pt-BR/auth.json');

// Ou usar useTranslations com generics (next-intl suporta)
// const t = useTranslations<'common'>('common');
```

### Preparacao RTL (futuro)

```tsx
// src/app/[locale]/layout.tsx
export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const isRTL = ['ar', 'he', 'fa'].includes(params.locale);
  return (
    <html lang={params.locale} dir={isRTL ? 'rtl' : 'ltr'}>
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
│   ├── request.ts              # getRequestConfig
│   ├── routing.ts              # defineRouting
│   └── index.ts                # barrel export
├── lib/
│   └── i18n/
│       ├── formatters.ts        # useDateFormatter, useNumberFormatter
│       └── index.ts
├── messages/
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── errors.json
│   ├── en/
│   │   ├── common.json
│   │   └── ...
│   └── es/
│       └── ...
├── components/
│   └── shared/
│       └── language-switcher.tsx
├── middleware.ts               # next-intl middleware
├── types/
│   └── i18n.ts                 # Key types (opcional)
└── app/
    └── [locale]/
        └── layout.tsx          # Layout com lang/dir
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

## Criterios de Aceite

- [ ] next-intl configurado com App Router e routing por locale
- [ ] Middleware detectando locale via cookie, header ou path
- [ ] Pelo menos 2 namespaces de traducao (common, auth ou equivalente)
- [ ] Componente LanguageSwitcher funcional com persistencia em cookie
- [ ] Formatacao de data, numero e moeda por locale implementada
- [ ] Pluralizacao via ICU Message Format em ao menos um caso
- [ ] Fallback para defaultLocale quando chave ou locale inexistente
- [ ] Tipagem ou inferencia de chaves de traducao (TypeScript)
- [ ] Documentacao de como adicionar novo idioma e namespace
- [ ] Testes unitarios para formatters e switcher (se aplicavel)

## Referencias

- [next-intl - App Router](https://next-intl-docs.vercel.app/docs/usage/configuration)
- [next-intl - Routing](https://next-intl-docs.vercel.app/docs/routing)
- [ICU Message Format - Pluralization](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Intl.DateTimeFormat - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [HTML dir attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
