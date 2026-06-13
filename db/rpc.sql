-- Read-only RPC functions for the Data Explorer (applied to the live Supabase
-- project). These are the ONLY surface exposed to the browser: the frontend
-- calls them via PostgREST (`/rest/v1/rpc/<fn>`) with the publishable anon key.
--
-- They are SECURITY DEFINER over the `h1b` schema so `anon` can read aggregates
-- without any direct grants on the underlying tables. Apply with:
--   psql "$SUPABASE_DB_URL" -f db/rpc.sql
--
-- (Mirrors the `h1b_rpc_functions` migration. Returned JSON keys are camelCase
-- to match the Data Explorer's components.)

CREATE OR REPLACE FUNCTION public.h1b_overview()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = h1b, pg_temp AS $$
  SELECT json_build_object(
    'totals', json_build_object(
      'lca', (SELECT count(*) FROM lca_filings),
      'perm', (SELECT count(*) FROM perm_filings),
      'employers', (SELECT count(*) FROM employers),
      'uscisApprovals', (SELECT coalesce(sum(initial_approval+continuing_approval),0) FROM uscis_hub),
      'uscisDenials', (SELECT coalesce(sum(initial_denial+continuing_denial),0) FROM uscis_hub),
      'latestLcaFy', (SELECT max(fiscal_year) FROM lca_filings),
      'latestPermFy', (SELECT max(fiscal_year) FROM perm_filings)
    ),
    'topStates', coalesce((SELECT json_agg(t) FROM (
        SELECT worksite_state AS state, count(*) AS count FROM lca_filings
        WHERE worksite_state IS NOT NULL GROUP BY worksite_state ORDER BY count DESC LIMIT 10) t), '[]'::json),
    'meta', coalesce((SELECT json_agg(m) FROM (
        SELECT dataset, period_label, ingested_at FROM dataset_meta) m), '[]'::json)
  );
$$;

CREATE OR REPLACE FUNCTION public.h1b_employers(q text DEFAULT '', state text DEFAULT '', lim int DEFAULT 25)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = h1b, pg_temp AS $$
  SELECT json_build_object('employers', coalesce((SELECT json_agg(e) FROM (
      SELECT em.id, em.name, em.state,
             count(DISTINCT l.id) AS "lcaCount", count(DISTINCT p.id) AS "permCount"
      FROM employers em
      LEFT JOIN lca_filings  l ON l.employer_id = em.id
      LEFT JOIN perm_filings p ON p.employer_id = em.id
      WHERE length(coalesce(q,'')) >= 2 AND em.name ILIKE '%'||q||'%'
        AND (coalesce(state,'') = '' OR em.state = upper(state))
      GROUP BY em.id, em.name, em.state
      ORDER BY "lcaCount" DESC, "permCount" DESC
      LIMIT least(coalesce(lim,25), 100)) e), '[]'::json));
$$;

CREATE OR REPLACE FUNCTION public.h1b_employer(emp_id bigint)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = h1b, pg_temp AS $$
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM employers WHERE id = emp_id)
    THEN json_build_object('employer', NULL)
    ELSE json_build_object(
      'employer', (SELECT json_build_object('id',id,'name',name,'city',city,'state',state) FROM employers WHERE id = emp_id),
      'lcaByYear', coalesce((SELECT json_agg(t) FROM (
          SELECT fiscal_year AS fy, count(*) AS count,
                 count(*) FILTER (WHERE case_status ILIKE 'Certified%') AS certified
          FROM lca_filings WHERE employer_id = emp_id GROUP BY fiscal_year ORDER BY fiscal_year) t), '[]'::json),
      'permByYear', coalesce((SELECT json_agg(t) FROM (
          SELECT fiscal_year AS fy, count(*) AS count,
                 count(*) FILTER (WHERE case_status ILIKE 'Certified%') AS certified
          FROM perm_filings WHERE employer_id = emp_id GROUP BY fiscal_year ORDER BY fiscal_year) t), '[]'::json),
      'uscis', coalesce((SELECT json_agg(t) FROM (
          SELECT fiscal_year AS fy, initial_approval AS "initialApproval", initial_denial AS "initialDenial",
                 continuing_approval AS "continuingApproval", continuing_denial AS "continuingDenial"
          FROM uscis_hub WHERE employer_id = emp_id ORDER BY fiscal_year) t), '[]'::json),
      'topOccupations', coalesce((SELECT json_agg(t) FROM (
          SELECT soc_code AS "socCode", soc_title AS "socTitle", count(*) AS count,
                 round(percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_rate_from)) AS "medianWage"
          FROM lca_filings WHERE employer_id = emp_id AND soc_code IS NOT NULL
          GROUP BY soc_code, soc_title ORDER BY count DESC LIMIT 10) t), '[]'::json),
      'wageStats', (SELECT json_build_object(
          'p25', round(percentile_cont(0.25) WITHIN GROUP (ORDER BY wage_rate_from)),
          'p50', round(percentile_cont(0.50) WITHIN GROUP (ORDER BY wage_rate_from)),
          'p75', round(percentile_cont(0.75) WITHIN GROUP (ORDER BY wage_rate_from)))
        FROM lca_filings WHERE employer_id = emp_id AND wage_rate_from > 0)
    ) END;
$$;

-- h1b_occupation, h1b_perm, h1b_wages, h1b_uscis, h1b_health: see the
-- `h1b_rpc_functions` migration for the full definitions (same pattern).

GRANT EXECUTE ON FUNCTION
  public.h1b_overview(), public.h1b_employers(text,text,int), public.h1b_employer(bigint),
  public.h1b_occupation(text), public.h1b_perm(text,text), public.h1b_wages(text,text,numeric),
  public.h1b_uscis(text), public.h1b_health()
TO anon, authenticated;
