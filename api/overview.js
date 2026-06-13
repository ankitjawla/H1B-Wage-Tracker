// GET /api/overview — top-level totals across all datasets for the landing tab.
import { withDb } from "./_db.js";

export default withDb(async (_req, _res, sql) => {
  const [lca, perm, uscis, employers, meta, topStates] = await Promise.all([
    sql`SELECT count(*)::bigint AS n, max(fiscal_year) AS fy FROM lca_filings`,
    sql`SELECT count(*)::bigint AS n, max(fiscal_year) AS fy FROM perm_filings`,
    sql`SELECT coalesce(sum(initial_approval + continuing_approval),0)::bigint AS approvals,
               coalesce(sum(initial_denial + continuing_denial),0)::bigint AS denials
        FROM uscis_hub`,
    sql`SELECT count(*)::bigint AS n FROM employers`,
    sql`SELECT dataset, period_label, ingested_at FROM dataset_meta`,
    sql`SELECT worksite_state AS state, count(*)::bigint AS n
        FROM lca_filings
        WHERE worksite_state IS NOT NULL
        GROUP BY worksite_state ORDER BY n DESC LIMIT 10`,
  ]);

  return {
    totals: {
      lca: Number(lca[0]?.n ?? 0),
      perm: Number(perm[0]?.n ?? 0),
      employers: Number(employers[0]?.n ?? 0),
      uscisApprovals: Number(uscis[0]?.approvals ?? 0),
      uscisDenials: Number(uscis[0]?.denials ?? 0),
      latestLcaFy: lca[0]?.fy ?? null,
      latestPermFy: perm[0]?.fy ?? null,
    },
    topStates: topStates.map((r) => ({ state: r.state, count: Number(r.n) })),
    meta,
  };
});
