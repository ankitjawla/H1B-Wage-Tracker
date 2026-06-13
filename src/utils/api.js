/**
 * Client for the Data Explorer's disclosure data.
 *
 * Reads real DOL/USCIS data from Supabase via read-only RPC functions (see
 * utils/supabase.js). There is intentionally NO synthetic/sample fallback: if
 * the database is unreachable, callers receive empty results flagged with
 * `source: "unavailable"` so the UI can say so honestly rather than show
 * fabricated numbers.
 *
 * Each call resolves to `{ data, source }` where `source` is:
 *   - "live"        : served from the database
 *   - "unavailable" : the request failed (network/permissions)
 */
import { callRpc } from "./supabase";

// Maps a logical endpoint to its RPC function + argument shape.
const RPC = {
  overview: () => ["h1b_overview", {}],
  employers: (p) => ["h1b_employers", { q: p.q ?? "", state: p.state ?? "", lim: p.limit ?? 25 }],
  employer: (p) => ["h1b_employer", { emp_id: Number(p.id) }],
  occupation: (p) => ["h1b_occupation", { soc: p.soc ?? "" }],
  perm: (p) => ["h1b_perm", { state: p.state ?? "", soc: p.soc ?? "" }],
  wages: (p) => ["h1b_wages", { soc: p.soc ?? "", state: p.state ?? "", salary: Number(p.salary) || 0 }],
  uscis: (p) => ["h1b_uscis", { employer: p.employer ?? "" }],
};

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
 * Fetch a Data Explorer endpoint from the database.
 * @param {"overview"|"employers"|"employer"|"occupation"|"perm"|"wages"|"uscis"} endpoint
 * @param {Object} [params]
 * @returns {Promise<{ data: Object, source: "live"|"unavailable" }>}
 */
export async function fetchData(endpoint, params = {}) {
  const build = RPC[endpoint];
  if (!build) return { data: {}, source: "unavailable" };

  // Employer search needs at least 2 characters; skip the round-trip otherwise.
  if (endpoint === "employers" && (params.q ?? "").trim().length < 2) {
    return { data: { employers: [] }, source: "live" };
  }

  try {
    const [fn, args] = build(params);
    const data = await callRpc(fn, args);
    return { data: data ?? EMPTY[endpoint], source: "live" };
  } catch {
    return { data: EMPTY[endpoint], source: "unavailable" };
  }
}
