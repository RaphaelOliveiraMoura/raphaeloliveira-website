"use client";

import { type RefObject, useSyncExternalStore } from "react";

import { slugify } from "@/lib/formatters";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
}

const EMPTY_ITEMS: TocItem[] = [];
const tocCache = new WeakMap<HTMLElement, { key: string; items: TocItem[] }>();

function getTocSnapshot(container: HTMLElement | null): TocItem[] {
  if (!container) return EMPTY_ITEMS;

  const headings = container.querySelectorAll<HTMLHeadingElement>("h2, h3");

  let key = "";
  headings.forEach((el) => {
    key += `${el.tagName}|${el.id || el.textContent};`;
  });

  const cached = tocCache.get(container);
  if (cached && cached.key === key) return cached.items;

  const tocItems: TocItem[] = [];
  headings.forEach((el) => {
    const id = el.id || slugify(el.textContent ?? "") || "";
    if (!el.id) el.id = id;
    tocItems.push({
      id,
      text: el.textContent ?? "",
      level: el.tagName === "H2" ? 2 : 3,
    });
  });

  tocCache.set(container, { key, items: tocItems });
  return tocItems;
}

export function TableOfContents({
  containerRef,
  className,
}: TableOfContentsProps) {
  const t = useTranslations("common");

  const items = useSyncExternalStore(
    (onStoreChange) => {
      const container = containerRef.current;
      if (!container) return () => {};

      const observer = new MutationObserver(onStoreChange);
      observer.observe(container, { childList: true, subtree: true });
      return () => observer.disconnect();
    },
    () => getTocSnapshot(containerRef.current),
    () => EMPTY_ITEMS,
  );

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t("tableOfContents.label")}
      className={cn("space-y-2", className)}
    >
      <h2 className="text-sm font-semibold text-foreground">
        {t("tableOfContents.title")}
      </h2>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: item.level === 3 ? "1rem" : 0 }}
          >
            <a
              href={`#${item.id}`}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
