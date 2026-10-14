import { buildDeskContent, DeskHome, DeskTextVersion } from "@/components/desk";
import { JsonLd } from "@/components/shared";

import { getMessages } from "@/lib/i18n";
import { buildPersonJsonLd } from "@/lib/seo";

export default async function PortfolioPage() {
  const messages = await getMessages();
  const content = buildDeskContent(messages.desk);

  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />
      <DeskHome content={content}>
        <DeskTextVersion content={content} />
      </DeskHome>
    </>
  );
}
