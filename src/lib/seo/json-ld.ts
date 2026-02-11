const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface OrganizationSchema {
  "@context": string;
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
}

export function buildOrganizationJsonLd(
  name: string,
  url: string,
  logo: string
): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    logo: logo.startsWith("http") ? logo : `${SITE_URL}${logo}`,
  };
}

export interface ArticleSchema {
  "@context": string;
  "@type": "Article";
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  author: { "@type": "Person"; name: string };
}

export function buildArticleJsonLd(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  author: string;
}): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url.startsWith("http") ? article.url : `${SITE_URL}${article.url}`,
    datePublished: article.datePublished,
    author: { "@type": "Person", name: article.author },
  };
}

export interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema {
  "@context": string;
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItem[];
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
