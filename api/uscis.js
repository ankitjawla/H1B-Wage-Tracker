// GET /api/uscis?employer=&year= — USCIS H-1B Employer Data Hub approvals.
import { withDb, str, int } from "./_db.js";

export default withDb(async (req, _res, sql) => {
  const employer = str(req.query?.employer);
  const year = int(req.query?.year, 0);

  const empF = employer.length >= 2 ? `%${employer}%` : null;
  const yearF = year || null;

  const [totals, byYear, topEmployers] = await Promise.all([
    sql`SELECT
           coalesce(sum(initial_approval),0)::bigint    AS ia,
           coalesce(sum(initial_denial),0)::bigint      AS id,
           coalesce(sum(continuing_approval),0)::bigint AS ca,
           coalesce(sum(continuing_denial),0)::bigint   AS cd
        FROM uscis_hub u JOIN employers e ON e.id = u.employer_id
        WHERE (${empF}::text IS NULL OR e.name ILIKE ${empF})
          AND (${yearF}::int IS NULL OR u.fiscal_year = ${yearF})`,
    sql`SELECT fiscal_year AS fy,
               sum(initial_approval)::bigint    AS ia,
               sum(initial_denial)::bigint      AS id,
               sum(continuing_approval)::bigint AS ca,
               sum(continuing_denial)::bigint   AS cd
        FROM uscis_hub u JOIN employers e ON e.id = u.employer_id
        WHERE (${empF}::text IS NULL OR e.name ILIKE ${empF})
        GROUP BY fiscal_year ORDER BY fiscal_year`,
    sql`SELECT e.id, e.name,
               sum(u.initial_approval + u.continuing_approval)::bigint AS approvals,
               sum(u.initial_denial + u.continuing_denial)::bigint     AS denials
        FROM uscis_hub u JOIN employers e ON e.id = u.employer_id
        WHERE (${empF}::text IS NULL OR e.name ILIKE ${empF})
          AND (${yearF}::int IS NULL OR u.fiscal_year = ${yearF})
        GROUP BY e.id, e.name ORDER BY approvals DESC LIMIT 15`,
  ]);

  const t = totals[0] || {};
  const approvals = Number(t.ia ?? 0) + Number(t.ca ?? 0);
  const denials = Number(t.id ?? 0) + Number(t.cd ?? 0);
  const decided = approvals + denials;

  return {
    totals: {
      initialApproval: Number(t.ia ?? 0),
      initialDenial: Number(t.id ?? 0),
      continuingApproval: Number(t.ca ?? 0),
      continuingDenial: Number(t.cd ?? 0),
      approvals,
      denials,
      approvalRate: decided > 0 ? Math.round((approvals / decided) * 1000) / 10 : null,
    },
    byYear: byYear.map((r) => ({
      fy: r.fy,
      initialApproval: Number(r.ia),
      initialDenial: Number(r.id),
      continuingApproval: Number(r.ca),
      continuingDenial: Number(r.cd),
    })),
    topEmployers: topEmployers.map((r) => ({
      id: Number(r.id),
      name: r.name,
      approvals: Number(r.approvals),
      denials: Number(r.denials),
    })),
  };
});
