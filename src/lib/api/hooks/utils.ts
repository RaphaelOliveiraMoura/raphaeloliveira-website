/**
 * Constroi uma query string a partir de um objeto de parametros.
 * Remove valores undefined/null.
 */
export function buildQueryString(
  params?: Record<string, unknown> | object,
): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }
  return `?${searchParams.toString()}`;
}
