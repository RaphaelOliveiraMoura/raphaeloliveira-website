import { format, formatDistanceToNow, type Locale, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export { DATE_FORMATS } from "./constants";
export { datePickerFormat, formatDateRange } from "./range";
export { formatInUserTimezone, toUserLocalDate } from "./timezone";

import { DATE_FORMATS } from "./constants";

export function formatDate(
  date: Date | string,
  pattern: keyof typeof DATE_FORMATS = "short",
  locale: Locale = ptBR,
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMATS[pattern], { locale });
}

export function formatRelativeTime(
  date: Date | string,
  options?: { addSuffix?: boolean; locale?: Locale },
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, {
    addSuffix: options?.addSuffix ?? true,
    locale: options?.locale ?? ptBR,
  });
}
