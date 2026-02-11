import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatInUserTimezone(
  date: Date | string,
  formatStr: string,
  timeZone = "America/Sao_Paulo"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, timeZone, formatStr, { locale: ptBR });
}

export function toUserLocalDate(
  utcDate: Date | string,
  timeZone = "America/Sao_Paulo"
): Date {
  const d = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;
  return toZonedTime(d, timeZone);
}
