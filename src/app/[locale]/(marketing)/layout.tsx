import { CookieConsentBanner } from "@/components/shared";

import { generateMetadata as generateSeoMetadata } from "@/lib/seo";
import { calculateYearsOfExperience } from "@/lib/utils/years-of-experience";

export const metadata = generateSeoMetadata({
  title: "Raphael Oliveira — Software Engineer",
  description: `Portfolio de Raphael de Oliveira Moura — Desenvolvedor fullstack com +${calculateYearsOfExperience()} anos de experiência em React, Node.js e TypeScript.`,
  path: "/",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CookieConsentBanner />
    </>
  );
}
