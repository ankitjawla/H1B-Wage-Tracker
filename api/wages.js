// GET /api/wages?soc=&state=&salary= — filed-wage distribution from LCA data.
// Powers the "Salary insights" tab: real offered wages (not just the DOL
// prevailing-wage thresholds) by occupation and location, plus where a given
// salary sits within that distribution.
import { withDb, str, int } from "./_db.js";

export default withDb(async (req, _res, sql) => {
  const soc = str(req.query?.soc);
  const state = str(req.query?.state).toUpperCase();
  const salary = int(req.query?.salary, 0);

  const socF = soc ? `${soc}%` : null;
  const stateF = state || null;

  const [dist, byLevel, byState, salaryRank] = await Promise.all([
    sql`SELECT count(*)::bigint AS n,
               min(wage_rate_from) AS min_w,
               percentile_cont(0.10) WITHIN GROUP (ORDER BY wage_rate_from) AS p10,
               percentile_cont(0.25) WITHIN GROUP (ORDER BY wage_rate_from) AS p25,
               percentile_cont(0.50) WITHIN GROUP (ORDER BY wage_rate_from) AS p50,
               percentile_cont(0.75) WITHIN GROUP (ORDER BY wage_rate_from) AS p75,
               percentile_cont(0.90) WITHIN GROUP (ORDER BY wage_rate_from) AS p90,
               max(wage_rate_from) AS max_w
        FROM lca_filings
        WHERE wage_rate_from > 0
          AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
          AND (${stateF}::text IS NULL OR worksite_state = ${stateF})`,
    sql`SELECT pw_wage_level AS level, count(*)::bigint AS n
        FROM lca_filings
        WHERE pw_wage_level IS NOT NULL
          AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
          AND (${stateF}::text IS NULL OR worksite_state = ${stateF})
        GROUP BY pw_wage_level ORDER BY pw_wage_level`,
    sql`SELECT worksite_state AS state,
               percentile_cont(0.5) WITHIN GROUP (ORDER BY wage_rate_from) AS median_wage,
               count(*)::bigint AS n
        FROM lca_filings
        WHERE wage_rate_from > 0 AND worksite_state IS NOT NULL
          AND (${socF}::text IS NULL OR soc_code ILIKE ${socF})
        GROUP BY worksite_state HAVING count(*) >= 5
        ORDER BY median_wage DESC LIMIT 15`,
    salary > 0
      ? sql`SELECT
               count(*) FILTER (WHERE wage_rate_from <= ${salary})::bigint AS below,
               count(*)::bigint AS total
            FROM lca_filings
            WHERE wage_rate_from > 0
              AND (${socF}::text   IS NULL OR soc_code ILIKE ${socF})
              AND (${stateF}::text IS NULL OR worksite_state = ${stateF})`
      : Promise.resolve([{ below: 0, total: 0 }]),
  ]);

  const round = (v) => (v === null || v === undefined ? null : Math.round(Number(v)));
  const rank = salaryRank[0];
  const total = Number(rank?.total ?? 0);

  return {
    distribution: {
      count: Number(dist[0]?.n ?? 0),
      min: round(dist[0]?.min_w),
      p10: round(dist[0]?.p10),
      p25: round(dist[0]?.p25),
      p50: round(dist[0]?.p50),
      p75: round(dist[0]?.p75),
      p90: round(dist[0]?.p90),
      max: round(dist[0]?.max_w),
    },
    byLevel: byLevel.map((r) => ({ level: r.level, count: Number(r.n) })),
    byState: byState.map((r) => ({
      state: r.state,
      medianWage: round(r.median_wage),
      count: Number(r.n),
    })),
    salaryPercentile:
      salary > 0 && total > 0
        ? { salary, percentile: Math.round((Number(rank.below) / total) * 100) }
        : null,
  };
});
