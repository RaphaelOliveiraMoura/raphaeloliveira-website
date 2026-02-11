import { useFormatter } from "next-intl";

export function useDateFormatter() {
  const format = useFormatter();
  return {
    date: (d: Date) => format.dateTime(d, { dateStyle: "medium" }),
    dateTime: (d: Date) =>
      format.dateTime(d, { dateStyle: "short", timeStyle: "short" }),
  };
}

export function useNumberFormatter() {
  const format = useFormatter();
  return {
    currency: (value: number, currency = "BRL") =>
      format.number(value, { style: "currency", currency }),
    number: (value: number) => format.number(value),
    percent: (value: number) =>
      format.number(value / 100, { style: "percent" }),
  };
}
