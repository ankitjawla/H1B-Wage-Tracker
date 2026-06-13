// GET /api/perm?state=&year=&soc= — PERM (green card) explorer aggregates.
import { withDb, str, int } from "./_db.js";

export default withDb(async (req, _res, sql) => {
  const state = str(req.query?.state).toUpperCase();
  const soc = str(req.query?.soc);
  const year = int(req.query?.year, 0);

  // Build a reusable WHERE via conditional tagged-template fragments. Neon's
  // driver parameterizes interpolated values, so this stays injection-safe.
  const stateF = state || null;
  const socF = soc ? `${soc}%` : null;
  const yearF = year || null;

  const [byYear, byStatus, topEmployers, topSoc, summary] = await Promise.all([
    sql`SELECT fiscal_year AS fy, count(*)::bigint AS n
        FROM perm_filings
        WHERE (${stateF}::text IS NULL OR worksite_state = ${stateF})
          AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
          AND (${yearF}::int    IS NULL OR fiscal_year = ${yearF})
        GROUP BY fiscal_year ORDER BY fiscal_year`,
    sql`SELECT case_status, count(*)::bigint AS n
        FROM perm_filings
        WHERE (${stateF}::text IS NULL OR worksite_state = ${stateF})
          AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
          AND (${yearF}::int    IS NULL OR fiscal_year = ${yearF})
        GROUP BY case_status ORDER BY n DESC`,
    sql`SELECT e.id, e.name, count(*)::bigint AS n
        FROM perm_filings p JOIN employers e ON e.id = p.employer_id
        WHERE (${stateF}::text IS NULL OR p.worksite_state = ${stateF})
          AND (${socF}::text   IS NULL OR p.soc_code ILIKE ${socF})
          AND (${yearF}::int    IS NULL OR p.fiscal_year = ${yearF})
        GROUP BY e.id, e.name ORDER BY n DESC LIMIT 10`,
    sql`SELECT soc_code, soc_title, count(*)::bigint AS n,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_offer) AS median_wage
        FROM perm_filings
        WHERE (${stateF}::text IS NULL OR worksite_state = ${stateF})
          AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
          AND (${yearF}::int    IS NULL OR fiscal_year = ${yearF})
          AND soc_code IS NOT NULL
        GROUP BY soc_code, soc_title ORDER BY n DESC LIMIT 10`,
    sql`SELECT count(*)::bigint AS total,
               count(*) FILTER (WHERE case_status ILIKE 'Certified%')::bigint AS certified,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_offer) AS median_wage
        FROM perm_filings
        WHERE (${stateF}::text IS NULL OR worksite_state = ${stateF})
          AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
          AND (${yearF}::int    IS NULL OR fiscal_year = ${yearF})`,
  ]);

  return {
    summary: {
      total: Number(summary[0]?.total ?? 0),
      certified: Number(summary[0]?.certified ?? 0),
      medianWage: summary[0]?.median_wage ? Math.round(Number(summary[0].median_wage)) : null,
    },
    byYear: byYear.map((r) => ({ fy: r.fy, count: Number(r.n) })),
    byStatus: byStatus.map((r) => ({ status: r.case_status, count: Number(r.n) })),
    topEmployers: topEmployers.map((r) => ({ id: Number(r.id), name: r.name, count: Number(r.n) })),
    topOccupations: topSoc.map((r) => ({
      socCode: r.soc_code,
      socTitle: r.soc_title,
      count: Number(r.n),
      medianWage: r.median_wage ? Math.round(Number(r.median_wage)) : null,
    })),
  };
});
