import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  // O proxy da PostHog (contrato em ~/projects/nexus/knowledge/metricas.md): o navegador manda
  // os eventos para /ingest no próprio domínio e o Next repassa para a região US, porque
  // bloqueador de anúncio corta us.i.posthog.com, não o caminho do site.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:caminho*",
        destination: "https://us-assets.i.posthog.com/static/:caminho*",
      },
      {
        source: "/ingest/:caminho*",
        destination: "https://us.i.posthog.com/:caminho*",
      },
    ];
  },
  // a API da PostHog usa barra no fim em alguns caminhos, e o redirecionamento automático do
  // Next quebraria o repasse
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
