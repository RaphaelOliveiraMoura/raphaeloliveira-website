# SEO

> **Status:** `rascunho`
> **Prioridade:** `alta`
> **Ultima atualizacao:** 2026-02-11

## Resumo

Sistema de SEO para o Core Stack utilizando a Metadata API do Next.js 16. Cobre metadata estatica e dinamica, Open Graph, Twitter Cards, JSON-LD estruturado (Organization, Product, Article, BreadcrumbList), sitemap dinamico, robots.txt, URLs canonicas, favicon e app icons, preview para redes sociais e utilitarios reutilizaveis (generateMetadata helper, builders de JSON-LD).

## Motivacao

Sites e aplicacoes precisam ser indexaveis e compartilhaveis. Sem metadata adequada, busca organica e compartilhamentos em redes sociais sofrem. O Core Stack deve oferecer uma base SEO pronta para landing pages, e-commerce e content sites, seguindo as melhores praticas do Google e plataformas sociais.

## Requisitos Funcionais

- **RF01:** Metadata estatica e dinamica via `generateMetadata` e `metadata` export
- **RF02:** Open Graph tags (og:title, og:description, og:image, og:type, og:url)
- **RF03:** Twitter Cards (twitter:card, twitter:title, twitter:description, twitter:image)
- **RF04:** JSON-LD estruturado para Organization, Product, Article e BreadcrumbList
- **RF05:** Sitemap dinamico via `sitemap.ts`
- **RF06:** robots.txt configurado (allow/disallow, sitemap)
- **RF07:** URLs canonicas para evitar conteudo duplicado
- **RF08:** Favicon e app icons (apple-touch-icon, etc.)
- **RF09:** Preview de compartilhamento social consistente
- **RF10:** Utilitarios centralizados (generateMetadata helper, builders de JSON-LD)

## Requisitos Nao-Funcionais

- **RNF01:** TypeScript - tipagem para metadata e schemas JSON-LD
- **RNF02:** Performance - metadata gerada no build quando possivel
- **RNF03:** Imagens Open Graph com tamanho recomendado (1200x630)

## Design da API / Interface

### Tipos auxiliares

```tsx
// src/types/seo.ts
interface Product {
  name: string
  description: string
  price: number
  image: string
  slug: string
  updatedAt: string
}

interface Article {
  title: string
  excerpt: string
  slug: string
  updatedAt: string
}
```

### generateMetadata e metadata estatica

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { generateMetadataBase } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  ...generateMetadataBase({
    title: 'Core Stack',
    description: 'Template base universal para projetos Next.js',
    openGraph: {
      title: 'Core Stack - Next.js Template',
      description: 'Template base universal para projetos Next.js',
      url: 'https://core-stack.example.com',
      siteName: 'Core Stack',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Core Stack - Next.js Template',
      description: 'Template base universal para projetos Next.js',
    },
  }),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
```

```tsx
// src/app/products/[slug]/page.tsx
import type { Metadata } from 'next';
import { generateMetadataBase } from '@/lib/seo/metadata';

// Funcoes de exemplo - substituir pela API real do projeto
async function getProduct(slug: string): Promise<Product> { /* ... */ }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Produto não encontrado' };

  return generateMetadataBase({
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://core-stack.example.com/products/${slug}`,
      images: product.image ? [{ url: product.image, width: 1200, height: 630 }] : undefined,
      type: 'website',
    },
    canonical: `https://core-stack.example.com/products/${slug}`,
  });
}
```

### Helper generateMetadataBase

```ts
// src/lib/seo/metadata.ts
import type { Metadata } from 'next';

interface MetadataInput {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    images?: Array<{ url: string; width?: number; height?: number }>;
    type?: 'website' | 'article';
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: string;
  };
  noIndex?: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-stack.example.com';

export function generateMetadataBase(input: MetadataInput): Metadata {
  const { title, description, canonical, openGraph, twitter, noIndex } = input;

  return {
    title: { default: title, template: `%s | Core Stack` },
    description,
    metadataBase: new URL(SITE_URL),
    ...(canonical && {
      alternates: { canonical: canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}` },
    }),
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: openGraph
      ? {
          title: openGraph.title ?? title,
          description: openGraph.description ?? description,
          url: openGraph.url ?? canonical ?? SITE_URL,
          siteName: openGraph.siteName ?? 'Core Stack',
          images: openGraph.images,
          type: openGraph.type ?? 'website',
        }
      : undefined,
    twitter: twitter
      ? {
          card: twitter.card ?? 'summary_large_image',
          title: twitter.title ?? title,
          description: twitter.description ?? description,
          images: twitter.image ? [twitter.image] : undefined,
        }
      : undefined,
  };
}
```

### JSON-LD Builders

```ts
// src/lib/seo/json-ld.ts
import type { WithContext, Organization, Product, Article, BreadcrumbList } from 'schema-dts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-stack.example.com';

export function buildOrganizationJsonLd(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Core Stack',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  };
}

export function buildProductJsonLd(product: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  url: string;
}): WithContext<Product> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image ? `${SITE_URL}${product.image}` : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
    },
    url: product.url.startsWith('http') ? product.url : `${SITE_URL}${product.url}`,
  };
}

export function buildArticleJsonLd(article: {
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  url: string;
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    author: { '@type': 'Person', name: article.author },
    url: article.url.startsWith('http') ? article.url : `${SITE_URL}${article.url}`,
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
```

### Componente JsonLd

```tsx
// src/components/shared/JsonLd.tsx
import type { Thing } from 'schema-dts';

interface JsonLdProps {
  data: Thing | Thing[];
}

export function JsonLd({ data }: JsonLdProps) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
```

```tsx
// src/app/layout.tsx
// Next.js App Router gerencia o <head> automaticamente.
// JsonLd renderiza <script type="application/ld+json"> e o Next.js
// se encarrega de hoistar para o <head> quando necessario.
import { JsonLd } from '@/components/shared/JsonLd';
import { buildOrganizationJsonLd } from '@/lib/seo/json-ld';

const organizationJsonLd = buildOrganizationJsonLd();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <JsonLd data={organizationJsonLd} />
        {children}
      </body>
    </html>
  )
}
```

### Sitemap dinamico

```ts
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-stack.example.com';

// Funcoes de exemplo - substituir pela API real do projeto
async function getProducts(): Promise<Product[]> { /* ... */ }
async function getArticles(): Promise<Article[]> { /* ... */ }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([getProducts(), getArticles()]);

  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const articleUrls = articles.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...productUrls,
    ...articleUrls,
  ];
}
```

### robots.txt

```ts
// src/app/robots.ts
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://core-stack.example.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

## Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx              # metadata base
│   ├── sitemap.ts              # sitemap dinamico
│   └── robots.ts               # robots.txt
├── lib/
│   └── seo/
│       ├── metadata.ts         # generateMetadataBase
│       ├── json-ld.ts          # builders Organization, Product, Article, BreadcrumbList
│       └── index.ts
├── components/
│   └── shared/
│       └── JsonLd.tsx
├── types/
│   └── seo.ts                  # Product, Article interfaces
└── public/
    ├── favicon.ico
    ├── apple-touch-icon.png
    └── og-image.png            # 1200x630 default OG image
```

## Dependencias

### Bibliotecas Externas

- `schema-dts` - tipos TypeScript para JSON-LD (Organization, Product, Article, BreadcrumbList)

### Specs Relacionados

- [Internacionalizacao](../e-infraestrutura/internacionalizacao.md) - metadata por locale
- [Seguranca & Configuracao](../e-infraestrutura/seguranca-configuracao.md) - SITE_URL via env tipada

## Criterios de Aceite

- [ ] generateMetadataBase helper implementado e usado no layout
- [ ] Metadata dinamica em ao menos uma pagina (ex: produto ou artigo)
- [ ] Open Graph e Twitter Cards configurados
- [ ] Builders JSON-LD para Organization, Product, Article e BreadcrumbList
- [ ] Componente JsonLd para injecao no head
- [ ] sitemap.ts gerando URLs dinamicamente
- [ ] robots.ts com regras e link para sitemap
- [ ] URLs canonicas em paginas com conteudo unico
- [ ] Favicon e apple-touch-icon em public/
- [ ] Imagem OG padrao 1200x630
- [ ] Documentacao de como estender metadata e JSON-LD

## Referencias

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup)
- [Google Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [schema-dts (npm)](https://www.npmjs.com/package/schema-dts)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
