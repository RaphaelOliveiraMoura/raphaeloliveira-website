"use client";

import { useState } from "react";

import {
  FileText,
  MessageSquare,
  Search as SearchIcon,
  User,
} from "lucide-react";

import { Breadcrumbs } from "@/components/navigation";
import { EmptyState, ErrorState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useSearch } from "@/lib/api/hooks";
import { useTranslations } from "@/lib/i18n";
import { useDebounce } from "@/hooks";

const TYPE_ICONS = {
  user: User,
  feedback: MessageSquare,
  "feature-flag": FileText,
  default: FileText,
} satisfies Record<string, typeof User>;

export default function SearchPage() {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, error, refetch } = useSearch({
    q: debouncedQuery,
    limit: 50,
  });

  const results = data?.results ?? [];

  // Agrupar resultados por tipo
  const grouped = results.reduce<Record<string, typeof results>>(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type]!.push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("search.globalSearch")}
        </h1>
        <p className="text-muted-foreground">
          Search across all entities in the system
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-10 text-lg"
          autoFocus
        />
      </div>

      {error ? (
        <ErrorState
          title="Search error"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : !debouncedQuery || debouncedQuery.length < 2 ? (
        <div className="py-12 text-center text-muted-foreground">
          <SearchIcon className="mx-auto mb-4 size-12 opacity-30" />
          <p>Type at least 2 characters to search</p>
        </div>
      ) : isLoading ? (
        <p className="py-8 text-center text-muted-foreground">{t("loading")}</p>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="size-8" />}
          title={t("search.noResults")}
          description={`No results found for "${debouncedQuery}"`}
        />
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} results for &quot;{debouncedQuery}&quot;
          </p>

          {Object.entries(grouped).map(([type, items]) => {
            const Icon =
              (TYPE_ICONS as Record<string, typeof User>)[type] ??
              TYPE_ICONS.default;
            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base capitalize">
                      {type}s
                    </CardTitle>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent/50"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          rank: {item.rank.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
