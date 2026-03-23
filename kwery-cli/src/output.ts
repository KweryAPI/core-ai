/**
 * Output formatters for CLI commands.
 */

export type OutputFormat = "json" | "table" | "csv";

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export function formatTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "(no data)";
  const headers = Object.keys(rows[0]);
  const colWidths = headers.map((h) =>
    Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? "").length)
    )
  );
  const divider = colWidths.map((w) => "-".repeat(w)).join("  ");
  const header = headers.map((h, i) => h.padEnd(colWidths[i])).join("  ");
  const body = rows
    .map((row) =>
      headers.map((h, i) => String(row[h] ?? "").padEnd(colWidths[i])).join("  ")
    )
    .join("\n");
  return [header, divider, body].join("\n");
}

export function printOutput(
  data: unknown,
  format: OutputFormat = "json"
): void {
  if (format === "json") {
    console.log(formatJson(data));
    return;
  }

  // Unwrap { data: [...] } envelope if present
  const unwrapped =
    !Array.isArray(data) && data !== null && typeof data === "object" && "data" in data
      ? (data as any).data
      : data;

  // For non-array responses (e.g. kwery limits returns a plain object),
  // pivot to [{key, value}] rows so table/csv output is readable.
  const rows: Record<string, unknown>[] = Array.isArray(unwrapped)
    ? (unwrapped as Record<string, unknown>[])
    : Object.entries(unwrapped as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: typeof value === "object" ? JSON.stringify(value) : value,
      }));

  if (format === "csv") {
    console.log(formatCsv(rows));
  } else {
    console.log(formatTable(rows));
  }
}

export function printError(message: string): void {
  console.error(`Error: ${message}`);
}
