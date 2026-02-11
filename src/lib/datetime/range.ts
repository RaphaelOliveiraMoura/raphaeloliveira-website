import { parseISO, format, parse, type Locale } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  options?: { locale?: Locale }
): string {
  const locale = options?.locale ?? ptBR;
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    return `${format(s, "d", { locale })} a ${format(e, "d 'de' MMM 'de' yyyy", { locale })}`;
  }
  return `${format(s, "d 'de' MMM", { locale })} a ${format(e, "d 'de' MMM 'de' yyyy", { locale })}`;
}

export const datePickerFormat = {
  display: (date: Date) => format(date, "dd/MM/yyyy", { locale: ptBR }),
  parse: (str: string) =>
    parse(str, "dd/MM/yyyy", new Date(), { locale: ptBR }),
};
