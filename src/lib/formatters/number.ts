export function abbreviateNumber(
  value: number,
  options?: { locale?: string; decimals?: number },
): string {
  const formatter = new Intl.NumberFormat(options?.locale ?? "pt-BR", {
    notation: "compact",
    maximumFractionDigits: options?.decimals ?? 1,
  });
  return formatter.format(value);
}
