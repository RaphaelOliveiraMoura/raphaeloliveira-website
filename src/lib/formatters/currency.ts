type CurrencyCode = "BRL" | "USD" | "EUR";

export function formatCurrency(
  value: number,
  options?: { currency?: CurrencyCode; locale?: string }
): string {
  return new Intl.NumberFormat(options?.locale ?? "pt-BR", {
    style: "currency",
    currency: options?.currency ?? "BRL",
  }).format(value);
}
