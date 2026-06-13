/**
 * Supabase connection for the Data Explorer.
 *
 * The Data Explorer reads real DOL/USCIS disclosure data directly from Supabase
 * via read-only PostgREST RPC functions (public.h1b_*), which run SECURITY
 * DEFINER over the isolated `h1b` schema. Only these aggregate functions are
 * exposed to the `anon` role — the underlying tables are not.
 *
 * The publishable key below is the public, browser-safe Supabase anon key
 * (designed to be shipped in client bundles); it is NOT a secret. Access is
 * limited to the read-only RPCs granted to `anon`.
 *
 * Override at build time with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 */
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://oyurnsjcnwbtfiukwtjm.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_pDgPN-mHbYabSqMf77iKdg_KvPmw4fd";

/**
 * Call a Postgres RPC function over PostgREST and return its JSON result.
 * @param {string} fn   function name (e.g. "h1b_overview")
 * @param {Object} params named arguments
 * @returns {Promise<any>} the function's JSON return value
 */
export async function callRpc(fn, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Supabase RPC ${fn} failed: HTTP ${res.status}`);
  }
  return res.json();
}
