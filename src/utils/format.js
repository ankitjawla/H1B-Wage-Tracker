/**
 * Display formatting helpers for the Data Explorer.
 */

/** 1234567 → "1,234,567" */
export const formatNumber = (n) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("en-US") : "—";

/** 1234567 → "1.2M", 12500 → "12.5K" */
export const formatCompact = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

/** 142000 → "$142,000" (whole dollars) */
export const formatUSD = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? `$${Math.round(n).toLocaleString("en-US")}`
    : "—";

/** Percentage with one decimal, e.g. 97 → "97.0%" */
export const formatPct = (n) =>
  typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";

/** Ordinal suffix, e.g. 73 → "73rd". */
export const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};
