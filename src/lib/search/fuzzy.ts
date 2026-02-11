import type { SearchResult } from "./types";

interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
}

interface FuzzySearchOptions {
  /** Campos a serem buscados (padrao: title e description) */
  keys?: (keyof SearchableItem)[];
  /** Numero maximo de resultados */
  maxResults?: number;
  /** Score minimo para incluir no resultado (0-1) */
  threshold?: number;
}

/**
 * Calcula um score de similaridade simples entre query e texto.
 * Retorna um valor entre 0 (nenhuma correspondencia) e 1 (match exato).
 */
function fuzzyScore(query: string, text: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase().trim();

  if (!normalizedQuery || !normalizedText) return 0;

  // Match exato
  if (normalizedText === normalizedQuery) return 1;

  // Contem a query inteira
  if (normalizedText.includes(normalizedQuery)) {
    return 0.8 + 0.2 * (normalizedQuery.length / normalizedText.length);
  }

  // Comeca com a query
  if (normalizedText.startsWith(normalizedQuery)) return 0.9;

  // Match por palavras
  const queryWords = normalizedQuery.split(/\s+/);
  const matchedWords = queryWords.filter((word) =>
    normalizedText.includes(word)
  );

  if (matchedWords.length > 0) {
    return 0.5 * (matchedWords.length / queryWords.length);
  }

  // Match por caracteres sequenciais (fuzzy)
  let queryIndex = 0;
  let matchCount = 0;

  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      matchCount++;
      queryIndex++;
    }
  }

  if (queryIndex === normalizedQuery.length) {
    return 0.3 * (matchCount / normalizedText.length);
  }

  return 0;
}

/**
 * Busca fuzzy em uma lista de itens.
 * Retorna resultados ordenados por relevancia.
 */
export function fuzzySearch(
  items: SearchableItem[],
  query: string,
  options: FuzzySearchOptions = {}
): SearchResult[] {
  const {
    keys = ["title", "description"],
    maxResults = 10,
    threshold = 0.2,
  } = options;

  if (!query.trim()) return [];

  const scored = items
    .map((item) => {
      const scores = keys.map((key) => {
        const value = item[key];
        if (typeof value !== "string") return 0;
        return fuzzyScore(query, value);
      });
      const bestScore = Math.max(...scores);
      return { item, score: bestScore };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored.map(({ item }) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    url: item.url,
    category: item.category,
  }));
}
