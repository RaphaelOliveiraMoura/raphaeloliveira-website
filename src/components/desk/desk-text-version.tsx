import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { DESK_SECTIONS, type DeskContent } from "./desk-content";
import { deskSerif } from "./desk-fonts";

export interface DeskTextVersionProps {
  content: DeskContent;
}

/** Todo o conteúdo da mesa em HTML semântico: renderizado no servidor. */
export function DeskTextVersion({ content }: DeskTextVersionProps) {
  const t = useTranslations("desk");
  const sections = DESK_SECTIONS.filter((key) => key !== "notebook");

  return (
    <article
      aria-label={t("list.title")}
      className="mx-auto max-w-3xl px-4 py-16 text-[#1D1B18] sm:px-10"
    >
      <header className="border-b border-[#D9D2C4] pb-8">
        <h1 className={cn(deskSerif.className, "text-5xl leading-none")}>
          {t("list.name")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#3E3A33]">
          {t("list.intro")}
        </p>
      </header>

      {sections.map((key) => (
        <section
          key={key}
          aria-labelledby={`desk-${key}`}
          className="border-b border-[#D9D2C4] py-8"
        >
          <h2
            id={`desk-${key}`}
            className="text-xs tracking-[0.14em] text-[#6E685C] uppercase"
          >
            {t(`sections.${key}.label`)}
          </h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2">
            {content[key].map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1">
                <h3
                  className={cn(deskSerif.className, "text-2xl leading-tight")}
                >
                  {entry.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#3E3A33]">
                  {entry.text}
                </p>
                {entry.meta && (
                  <p className="text-xs text-[#6E685C]">{entry.meta}</p>
                )}
                {entry.href && (
                  <a
                    href={entry.href}
                    className="self-start text-xs underline underline-offset-4"
                    {...(entry.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {entry.cta || t("list.visit")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
