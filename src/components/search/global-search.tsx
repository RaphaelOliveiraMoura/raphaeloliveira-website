"use client";

import { useCallback, useState } from "react";

import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT = 5;

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    RECENT_SEARCHES_KEY,
    []
  );
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("common");

  const addRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;
    setRecentSearches((prev) => {
      const list = prev ?? [];
      const filtered = list.filter((s) => s !== search);
      return [search, ...filtered].slice(0, MAX_RECENT);
    });
  }, [setRecentSearches]);

  const handleSelectRecent = useCallback(
    (search: string) => {
      setQuery(search);
      addRecentSearch(search);
      setIsOpen(false);
    },
    [addRecentSearch]
  );

  const showRecent = isOpen && !debouncedQuery && (recentSearches ?? []).length > 0;

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() =>
            setTimeout(() => setIsOpen(false), 150)
          }
          placeholder={t("search.placeholder")}
          className="pl-9"
          aria-label={t("search.globalSearch")}
          aria-expanded={showRecent}
          aria-haspopup="listbox"
        />
      </div>
      {showRecent && (
        <ul
          role="listbox"
          className="bg-popover border-border absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-md border shadow-md"
        >
          <li
            className="text-muted-foreground px-3 py-2 text-xs font-medium"
            role="presentation"
          >
            {t("search.recentSearches")}
          </li>
          {(recentSearches ?? []).map((s) => (
            <li key={s} role="option" aria-selected={false}>
              <button
                type="button"
                className={cn(
                  "hover:bg-accent flex w-full px-3 py-2 text-left text-sm"
                )}
                onClick={() => handleSelectRecent(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
