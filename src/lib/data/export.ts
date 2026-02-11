import { isClient } from "@/lib/utils/environment";

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  if (!isClient()) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename = "export.csv",
) {
  if (data.length === 0) return;
  const first = data[0] as T;
  const headers = Object.keys(first);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

export function exportToJson<T>(data: T[], filename = "export.json") {
  downloadFile(JSON.stringify(data, null, 2), filename, "application/json");
}
