// GET /api/occupation?soc= — SOC-centric view combining LCA + PERM + geography.
import { withDb, str } from "./_db.js";

export default withDb(async (req, _res, sql) => {
  const soc = str(req.query?.soc);
  const socF = soc ? `${soc}%` : null;

  const [summary, byYear, wageTrend, topEmployers, topStates, socTitle] = await Promise.all([
    sql`SELECT
           (SELECT count(*) FROM lca_filings  WHERE (${socF}::text IS NULL OR soc_code ILIKE ${socF}))::bigint AS lca,
           (SELECT count(*) FROM perm_filings WHERE (${socF}::text IS NULL OR soc_code ILIKE ${socF}))::bigint AS perm,
           (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_rate_from)
              FROM lca_filings WHERE wage_rate_from > 0
                AND (${socF}::text IS NULL OR soc_code ILIKE ${socF})) AS median_wage`,
    sql`SELECT fiscal_year AS fy, count(*)::bigint AS n
        FROM lca_filings
        WHERE (${socF}::text IS NULL OR soc_code ILIKE ${socF})
        GROUP BY fiscal_year ORDER BY fiscal_year`,
    sql`SELECT fiscal_year AS fy,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_rate_from) AS median_wage
        FROM lca_filings
        WHERE wage_rate_from > 0 AND (${socF}::text IS NULL OR soc_code ILIKE ${socF})
        GROUP BY fiscal_year ORDER BY fiscal_year`,
    sql`SELECT e.id, e.name, count(*)::bigint AS n
        FROM lca_filings l JOIN employers e ON e.id = l.employer_id
        WHERE (${socF}::text IS NULL OR l.soc_code ILIKE ${socF})
        GROUP BY e.id, e.name ORDER BY n DESC LIMIT 10`,
    sql`SELECT worksite_state AS state,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_rate_from) AS median_wage,
               count(*)::bigint AS n
        FROM lca_filings
        WHERE wage_rate_from > 0 AND worksite_state IS NOT NULL
          AND (${socF}::text IS NULL OR soc_code ILIKE ${socF})
        GROUP BY worksite_state HAVING count(*) >= 5
        ORDER BY n DESC LIMIT 12`,
    socF
      ? sql`SELECT soc_title FROM lca_filings
             WHERE soc_code ILIKE ${socF} AND soc_title IS NOT NULL LIMIT 1`
      : Promise.resolve([]),
  ]);

  const round = (v) => (v === null || v === undefined ? null : Math.round(Number(v)));

  return {
    soc: soc || null,
    socTitle: socTitle[0]?.soc_title ?? null,
    summary: {
      lca: Number(summary[0]?.lca ?? 0),
      perm: Number(summary[0]?.perm ?? 0),
      medianWage: round(summary[0]?.median_wage),
    },
    byYear: byYear.map((r) => ({ fy: r.fy, count: Number(r.n) })),
    wageTrend: wageTrend.map((r) => ({ fy: r.fy, medianWage: round(r.median_wage) })),
    topEmployers: topEmployers.map((r) => ({ id: Number(r.id), name: r.name, count: Number(r.n) })),
    topStates: topStates.map((r) => ({
      state: r.state,
      medianWage: round(r.median_wage),
      count: Number(r.n),
    })),
  };
});
