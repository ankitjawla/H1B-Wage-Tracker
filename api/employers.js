// GET /api/employers?q=&state=&limit= — search employers with rollup counts.
import { withDb, str, int } from "./_db.js";

export default withDb(async (req, _res, sql) => {
  const q = str(req.query?.q);
  const state = str(req.query?.state).toUpperCase();
  const limit = int(req.query?.limit, 25, 100);

  if (q.length < 2) {
    return { employers: [], note: "Enter at least 2 characters to search." };
  }

  const pattern = `%${q}%`;
  const rows = state
    ? await sql`
        SELECT e.id, e.name, e.state,
               count(DISTINCT l.id)::bigint AS lca_count,
               count(DISTINCT p.id)::bigint AS perm_count
        FROM employers e
        LEFT JOIN lca_filings  l ON l.employer_id  = e.id
        LEFT JOIN perm_filings p ON p.employer_id  = e.id
        WHERE e.name ILIKE ${pattern} AND e.state = ${state}
        GROUP BY e.id, e.name, e.state
        ORDER BY lca_count DESC, perm_count DESC
        LIMIT ${limit}`
    : await sql`
        SELECT e.id, e.name, e.state,
               count(DISTINCT l.id)::bigint AS lca_count,
               count(DISTINCT p.id)::bigint AS perm_count
        FROM employers e
        LEFT JOIN lca_filings  l ON l.employer_id  = e.id
        LEFT JOIN perm_filings p ON p.employer_id  = e.id
        WHERE e.name ILIKE ${pattern}
        GROUP BY e.id, e.name, e.state
        ORDER BY lca_count DESC, perm_count DESC
        LIMIT ${limit}`;

  return {
    employers: rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      state: r.state,
      lcaCount: Number(r.lca_count),
      permCount: Number(r.perm_count),
    })),
  };
});
