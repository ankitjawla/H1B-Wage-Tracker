/**
 * CSV export helpers for the Data Explorer.
 */

/** Escape a single CSV field per RFC 4180 (quote if it contains , " or newline). */
function escapeField(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Serialize an array of row objects to a CSV string.
 * @param {Array<Object>} rows
 * @param {Array<{ key: string, label?: string }>} columns ordered columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
  if (!Array.isArray(rows) || !Array.isArray(columns) || columns.length === 0) return "";
  const header = columns.map((c) => escapeField(c.label ?? c.key)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeField(row[c.key])).join(","));
  return [header, ...body].join("\n");
}

/**
 * Trigger a browser download of CSV text. No-op outside the browser.
 * @param {string} filename
 * @param {string} csv
 */
export function downloadCsv(filename, csv) {
  if (typeof document === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
