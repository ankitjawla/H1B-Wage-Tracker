/**
 * Client for the Data Explorer's disclosure data.
 *
 * Reads real DOL/USCIS data from the Vercel serverless API (`/api/*`), which
 * queries the Neon Postgres database. There is intentionally NO synthetic/sample
 * fallback: if the database isn't configured or is unreachable, callers receive
 * an empty result flagged `source: "unavailable"` so the UI can say so honestly
 * rather than show fabricated numbers.
 *
 * Each call resolves to `{ data, source }` where `source` is:
 *   - "live"        : served from the database
 *   - "unavailable" : DB not configured (no DATABASE_URL) or the request failed
 */

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  const q = usp.toString();
  return q ? `?${q}` : "";
}

// Minimal empty shapes so tab components render an honest empty state.
const EMPTY = {
  overview: { totals: {}, topStates: [], meta: [] },
  employers: { employers: [] },
  employer: { employer: null },
  occupation: { summary: {}, byYear: [], wageTrend: [], topEmployers: [], topStates: [] },
  perm: { summary: {}, byYear: [], byStatus: [], topEmployers: [], topOccupations: [] },
  wages: { distribution: {}, byLevel: [], byState: [], salaryPercentile: null },
  uscis: { totals: {}, byYear: [], topEmployers: [] },
};

/**
 * Fetch a Data Explorer endpoint from the serverless API.
 * @param {"overview"|"employers"|"employer"|"occupation"|"perm"|"wages"|"uscis"} endpoint
 * @param {Object} [params]
 * @returns {Promise<{ data: Object, source: "live"|"unavailable" }>}
 */
export async function fetchData(endpoint, params = {}) {
  // Employer search needs at least 2 characters; skip the round-trip otherwise.
  if (endpoint === "employers" && (params.q ?? "").trim().length < 2) {
    return { data: { employers: [] }, source: "live" };
  }

  try {
    const res = await fetch(`/api/${endpoint}${buildQuery(params)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // The API returns { configured: false } when DATABASE_URL isn't set.
    if (json.configured === false) {
      return { data: EMPTY[endpoint] ?? {}, source: "unavailable" };
    }
    return { data: json, source: "live" };
  } catch {
    return { data: EMPTY[endpoint] ?? {}, source: "unavailable" };
  }
}
