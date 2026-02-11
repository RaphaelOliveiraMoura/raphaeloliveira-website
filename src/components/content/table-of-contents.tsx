"use client";

import { useEffect, useState, type RefObject } from "react";

import { cn } from "@/lib/utils";
import { slugify } from "@/lib/formatters";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
}

export function TableOfContents({
  containerRef,
  className,
}: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll<HTMLHeadingElement>(
      "h2, h3"
    );

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

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Items are derived from DOM headings; reading the DOM requires an effect
    setItems(tocItems);
  }, [containerRef]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Índice" className={cn("space-y-2", className)}>
      <h2 className="text-sm font-semibold text-foreground">Nesta página</h2>
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
