/**
 * Client for the disclosure-data API (/api/*).
 *
 * Each call resolves to `{ data, source }` where `source` is:
 *   - "live"   : served by the Neon-backed API
 *   - "sample" : the API is unconfigured/unreachable, so clearly-labeled
 *                illustrative sample data is returned instead
 *
 * This lets the Data Explorer render meaningfully before the Neon integration
 * is wired up, while never passing fabricated numbers off as real.
 */
import { SAMPLE } from "../data/sampleData";

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : "";
}

/**
 * Fetch a disclosure-data endpoint with sample fallback.
 * @param {"overview"|"employers"|"employer"|"perm"|"wages"|"uscis"} endpoint
 * @param {Object} [params] query parameters
 * @returns {Promise<{ data: Object, source: "live"|"sample" }>}
 */
export async function fetchData(endpoint, params = {}) {
  try {
    const res = await fetch(`/api/${endpoint}${buildQuery(params)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.configured === false || json.source === "error") {
      return { data: sampleFor(endpoint, params), source: "sample" };
    }
    return { data: json, source: "live" };
  } catch {
    return { data: sampleFor(endpoint, params), source: "sample" };
  }
}

/** Resolve the matching sample payload for an endpoint. */
function sampleFor(endpoint, params) {
  if (endpoint === "employers") {
    const q = (params.q || "").toLowerCase();
    const employers = SAMPLE.employers.filter((e) => e.name.toLowerCase().includes(q));
    return { employers: q.length >= 2 ? employers : [] };
  }
  if (endpoint === "employer") {
    return SAMPLE.employerProfile;
  }
  return SAMPLE[endpoint] ?? {};
}
