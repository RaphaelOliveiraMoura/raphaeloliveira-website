# Formatadores & Date/Time

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Última atualização:** 2026-02-11

## Resumo

Sistema de formatação para o Core Stack: moeda (BRL, USD, EUR com locale-aware), abreviação de números (1.2K, 3.5M), documentos brasileiros para exibição (CPF, CNPJ), utilitários de string (truncate, capitalize, slugify, pluralize), formatação de endereço (padrões BR com CEP), manipulação de datas com date-fns, tratamento de timezone, tempo relativo ("há 2 horas") e range de datas. Integração com padrões de date picker.

## Motivação

Aplicações precisam exibir dados de forma consistente e localizada. Um template base deve centralizar a lógica de formatação para evitar duplicação e inconsistências entre telas. O mercado brasileiro tem requisitos específicos: moeda em R$, documentos com máscara de exibição, CEP no endereço e datas em dd/MM/yyyy. Suporte a timezone e tempo relativo é essencial para dashboards e feeds de atividade.

## Requisitos Funcionais

- **RF01:** Formatação de moeda com Intl (BRL, USD, EUR), locale-aware
- **RF02:** Abreviação de números (1.2K, 3.5M, 1.2B) configurável
- **RF03:** Formatação de documentos BR para display (CPF: 123.456.789-00, CNPJ: 12.345.678/0001-00)
- **RF04:** Utilitários de string: truncate, capitalize, slugify, pluralize
- **RF05:** Formatação de endereço (padrões BR com CEP)
- **RF06:** Manipulação de datas com date-fns (format, parse, add, diff)
- **RF07:** Tratamento de timezone (TZ do usuário, conversão, exibição)
- **RF08:** Tempo relativo ("há 2 horas", "há 5 minutos", "em 3 dias")
- **RF09:** Formatação de range de datas (ex: "10 a 15 de fev. de 2026")
- **RF10:** Padrões para integração com date picker (format de valor, parse de string)

## Requisitos Não-Funcionais

- **RNF01:** Performance - funções puras, sem side effects, fáceis de testar
- **RNF02:** Internacionalização - locale configurável (pt-BR, en-US, etc.)
- **RNF03:** TypeScript - tipos explícitos para parâmetros e retorno
- **RNF04:** Tree-shaking - módulos pequenos e exportáveis separadamente

## Design da API / Interface

### Moeda e números

```ts
// src/lib/formatters/currency.ts
type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export function formatCurrency(
  value: number,
  options?: { currency?: CurrencyCode; locale?: string }
): string {
  return new Intl.NumberFormat(options?.locale ?? 'pt-BR', {
    style: 'currency',
    currency: options?.currency ?? 'BRL',
  }).format(value);
}

// formatCurrency(1234.56) → "R$ 1.234,56"
// formatCurrency(1234.56, { currency: 'USD', locale: 'en-US' }) → "$1,234.56"

// src/lib/formatters/number.ts
export function abbreviateNumber(
  value: number,
  options?: { locale?: string; decimals?: number }
): string {
  const formatter = new Intl.NumberFormat(options?.locale ?? 'pt-BR', {
    notation: 'compact',
    maximumFractionDigits: options?.decimals ?? 1,
  });
  return formatter.format(value);
}
// abbreviateNumber(1200) → "1,2 mil"
// abbreviateNumber(3500000) → "3,5 mi"
// abbreviateNumber(1200000000) → "1,2 bi"
//
// Nota: Intl.NumberFormat com notation: 'compact' produz saida locale-especifica.
// pt-BR: "1,2 mil", "3,5 mi", "1,2 bi"
// en-US: "1.2K", "3.5M", "1.2B"
// Este e o comportamento esperado — o locale controla o formato de saida.
```

### Documentos brasileiros

```ts
// src/lib/formatters/document.ts
export function formatCpf(value: string | number): string {
  const digits = String(value).replace(/\D/g, '').padStart(11, '0');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCnpj(value: string | number): string {
  const digits = String(value).replace(/\D/g, '').padStart(14, '0');
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatCep(value: string | number): string {
  const digits = String(value).replace(/\D/g, '').padStart(8, '0');
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}
// formatCpf('12345678900') → "123.456.789-00"
// formatCnpj('12345678000100') → "12.345.678/0001-00"
```

### Utilitários de string

```ts
// src/lib/formatters/string.ts
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's');
}
// truncate('Hello World', 8) → "Hello..."
// capitalize('hello') → "Hello"
// slugify('Olá Mundo!') → "ola-mundo"
// pluralize(1, 'item') → "item"; pluralize(5, 'item') → "items"
```

### Endereço

```ts
// src/lib/formatters/address.ts
import { formatCep } from './document';

interface BrazilianAddress {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
}

export function formatAddress(address: BrazilianAddress): string {
  const parts = [
    address.street + (address.number ? `, ${address.number}` : ''),
    address.complement,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    formatCep(address.zipCode),
  ].filter(Boolean);
  return parts.join(' • ');
}
// "Av. Brasil, 1000 • Centro • São Paulo - SP • 01310-100"
```

### Datas com date-fns

```ts
// src/lib/datetime/constants.ts
// Constantes de formato centralizadas, re-exportadas via src/lib/datetime/index.ts
export const DATE_FORMATS = {
  short: 'dd/MM/yyyy',
  long: "d 'de' MMMM 'de' yyyy",
  time: 'HH:mm',
  datetime: 'dd/MM/yyyy HH:mm',
  iso: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// src/lib/datetime/index.ts
import {
  format,
  parse,
  parseISO,
  formatDistanceToNow,
  addDays,
  subHours,
  type Locale,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export { DATE_FORMATS } from './constants';

export function formatDate(
  date: Date | string,
  pattern: keyof typeof DATE_FORMATS = 'short',
  locale = ptBR
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATE_FORMATS[pattern], { locale });
}

export function formatRelativeTime(
  date: Date | string,
  baseDate = new Date(),
  options?: { addSuffix?: boolean; locale?: Locale }
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, {
    addSuffix: options?.addSuffix ?? true,
    locale: options?.locale ?? ptBR,
  });
}
// formatRelativeTime(subHours(new Date(), 2)) → "há 2 horas"
// formatRelativeTime(addDays(new Date(), 3)) → "em 3 dias"
```

### Range de datas e date picker

```ts
// src/lib/datetime/range.ts
import { parseISO, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  options?: { locale?: Locale }
): string {
  const locale = options?.locale ?? ptBR;
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${format(s, 'd', { locale })} a ${format(e, "d 'de' MMM 'de' yyyy", { locale })}`;
  }
  return `${format(s, "d 'de' MMM", { locale })} a ${format(e, "d 'de' MMM 'de' yyyy", { locale })}`;
}

// Integração com date picker (react-day-picker / shadcn Calendar)
export const datePickerFormat = {
  display: (date: Date) => format(date, 'dd/MM/yyyy', { locale: ptBR }),
  parse: (str: string) => parse(str, 'dd/MM/yyyy', new Date(), { locale: ptBR }),
};
```

### Timezone

```ts
// src/lib/datetime/timezone.ts
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatInUserTimezone(
  date: Date | string,
  formatStr: string,
  timeZone = 'America/Sao_Paulo'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, timeZone, formatStr, { locale: ptBR });
}

export function toUserLocalDate(utcDate: Date | string, timeZone = 'America/Sao_Paulo'): Date {
  const d = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return toZonedTime(d, timeZone);
}
```

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── formatters/
│   │   ├── currency.ts
│   │   ├── number.ts
│   │   ├── document.ts
│   │   ├── string.ts
│   │   ├── address.ts
│   │   └── index.ts
│   └── datetime/
│       ├── index.ts           # Re-exporta DATE_FORMATS, formatDate, formatRelativeTime
│       ├── constants.ts       # DATE_FORMATS (constantes centralizadas)
│       ├── range.ts
│       └── timezone.ts
```

## Dependências

### Bibliotecas Externas

- `date-fns` - manipulação e formatação de datas
- `date-fns-tz` - suporte a timezone
- APIs nativas: `Intl.NumberFormat`, `Intl.DateTimeFormat`

### Specs Relacionados

- [Formulários](./formularios.md) - máscaras de input (complementam formatação de display)
- [Internacionalização](../e-infraestrutura/internacionalizacao.md) - locale e pluralize
- [Componentes & Storybook](../a-fundacao-visual/componentes-storybook.md) - Calendar/DatePicker

## Notas de Implementação

- Os formatadores desta spec são **funções puras** que recebem locale como parâmetro opcional. A spec de [Internacionalização](../e-infraestrutura/internacionalizacao.md) fornece o locale ativo via contexto. Integrar assim: `formatCurrency(value, { locale: currentLocale })`.
- Funções de formatação de data/hora utilizam `date-fns` como base. A spec de i18n pode re-exportar wrappers locale-aware sobre estas funções.

## Critérios de Aceite

- [ ] RF01: formatCurrency para BRL, USD, EUR com locale configurável
- [ ] RF02: abbreviateNumber retorna "1,2 mil", "3,5 mi", "1,2 bi" conforme locale
- [ ] RF03: formatCpf e formatCnpj aplicam máscara de exibição correta
- [ ] RF04: truncate, capitalize, slugify, pluralize implementados e testados
- [ ] RF05: formatAddress com padrão brasileiro e CEP formatado
- [ ] RF06: formatDate com date-fns e patterns short/long/datetime
- [ ] RF07: formatInUserTimezone e toUserLocalDate com date-fns-tz
- [ ] RF08: formatRelativeTime em pt-BR ("há 2 horas", "em 3 dias")
- [ ] RF09: formatDateRange para ranges no mesmo mês/ano
- [ ] RF10: datePickerFormat.display e .parse para integração com Calendar
- [ ] Testes unitários para todas as funções
- [ ] Barrel export em index.ts para cada módulo

## Referências

- [date-fns](https://date-fns.org/)
- [date-fns-tz](https://github.com/marnusw/date-fns-tz)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [shadcn Calendar](https://ui.shadcn.com/docs/components/calendar)
