// GET /api/employer?id= — full profile for one employer across all datasets.
import { withDb, int } from "./_db.js";

export default withDb(async (req, res, sql) => {
  const id = int(req.query?.id, 0);
  if (!id) {
    res.status(400).json({ configured: true, error: "Missing employer id" });
    return;
  }

  const [emp] = await sql`SELECT id, name, city, state FROM employers WHERE id = ${id}`;
  if (!emp) {
    res.status(404).json({ configured: true, error: "Employer not found" });
    return;
  }

  const [lcaByYear, permByYear, uscis, topSoc, wageStats] = await Promise.all([
    sql`SELECT fiscal_year AS fy, count(*)::bigint AS n,
               count(*) FILTER (WHERE case_status ILIKE 'Certified%')::bigint AS certified
        FROM lca_filings WHERE employer_id = ${id}
        GROUP BY fiscal_year ORDER BY fiscal_year`,
    sql`SELECT fiscal_year AS fy, count(*)::bigint AS n,
               count(*) FILTER (WHERE case_status ILIKE 'Certified%')::bigint AS certified
        FROM perm_filings WHERE employer_id = ${id}
        GROUP BY fiscal_year ORDER BY fiscal_year`,
    sql`SELECT fiscal_year AS fy, initial_approval, initial_denial,
               continuing_approval, continuing_denial
        FROM uscis_hub WHERE employer_id = ${id} ORDER BY fiscal_year`,
    sql`SELECT soc_code, soc_title, count(*)::bigint AS n,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_rate_from) AS median_wage
        FROM lca_filings WHERE employer_id = ${id} AND soc_code IS NOT NULL
        GROUP BY soc_code, soc_title ORDER BY n DESC LIMIT 10`,
    sql`SELECT
               percentile_cont(0.25) WITHIN GROUP (ORDER BY wage_rate_from) AS p25,
               percentile_cont(0.50) WITHIN GROUP (ORDER BY wage_rate_from) AS p50,
               percentile_cont(0.75) WITHIN GROUP (ORDER BY wage_rate_from) AS p75
        FROM lca_filings WHERE employer_id = ${id} AND wage_rate_from > 0`,
  ]);

  return {
    employer: { id: Number(emp.id), name: emp.name, city: emp.city, state: emp.state },
    lcaByYear: lcaByYear.map((r) => ({
      fy: r.fy,
      count: Number(r.n),
      certified: Number(r.certified),
    })),
    permByYear: permByYear.map((r) => ({
      fy: r.fy,
      count: Number(r.n),
      certified: Number(r.certified),
    })),
    uscis: uscis.map((r) => ({
      fy: r.fy,
      initialApproval: r.initial_approval,
      initialDenial: r.initial_denial,
      continuingApproval: r.continuing_approval,
      continuingDenial: r.continuing_denial,
    })),
    topOccupations: topSoc.map((r) => ({
      socCode: r.soc_code,
      socTitle: r.soc_title,
      count: Number(r.n),
      medianWage: r.median_wage ? Math.round(Number(r.median_wage)) : null,
    })),
    wageStats: wageStats[0]
      ? {
          p25: wageStats[0].p25 ? Math.round(Number(wageStats[0].p25)) : null,
          p50: wageStats[0].p50 ? Math.round(Number(wageStats[0].p50)) : null,
          p75: wageStats[0].p75 ? Math.round(Number(wageStats[0].p75)) : null,
        }
      : null,
  };
});
