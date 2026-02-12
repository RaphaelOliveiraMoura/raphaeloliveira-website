import {
  MarketingFooter,
  MarketingNavbar,
  PageTransition,
} from "@/components/layouts";
import { CookieConsentBanner } from "@/components/shared";

import { generateMetadata as generateSeoMetadata } from "@/lib/seo";

export const metadata = generateSeoMetadata({
  title: "Core Stack",
  description:
    "Template base universal para projetos Next.js com componentes, hooks e utilitarios prontos para producao.",
  path: "/",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <MarketingFooter />
      <CookieConsentBanner />
    </div>
  );
}
