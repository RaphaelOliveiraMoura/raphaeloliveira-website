/**
 * A URL e o nome do site num lugar só (padrão em ~/projects/nexus/knowledge/padrao-sites-vercel.md):
 * metadataBase, canonical, Open Graph, JSON-LD, robots e sitemap saem daqui. O canônico é o www,
 * e o fallback é a produção, nunca localhost: sem a env na Vercel, o site anunciava
 * http://localhost:3000 em todas essas tags (auditoria de 2026-10-26).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.raphaeloliveira.dev";

export const SITE_NAME = "Raphael Oliveira";
