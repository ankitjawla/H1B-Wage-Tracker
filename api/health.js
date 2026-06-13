// GET /api/health — operational check for the disclosure-data backend.
//
// Lets the operator confirm, after connecting the Vercel Neon integration and
// running db/ingest.mjs, that the database is reachable and how many rows are
// loaded. Returns `configured: false` when no DATABASE_URL is set (the app
// still works on sample data), and `connected: false` if a query fails.
import { isDbConfigured, getSql } from "./_db.js";

export default async function handler(_req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (!isDbConfigured()) {
    res.status(200).json({
      configured: false,
      connected: false,
      message: "DATABASE_URL not set — Data Explorer is serving sample data.",
    });
    return;
  }

  try {
    const sql = getSql();
    const [counts] = await sql`
      SELECT
        (SELECT count(*) FROM employers)::bigint    AS employers,
        (SELECT count(*) FROM lca_filings)::bigint   AS lca,
        (SELECT count(*) FROM perm_filings)::bigint  AS perm,
        (SELECT count(*) FROM uscis_hub)::bigint     AS uscis`;
    const meta = await sql`SELECT dataset, period_label, row_count, ingested_at FROM dataset_meta`;

    res.status(200).json({
      configured: true,
      connected: true,
      counts: {
        employers: Number(counts.employers),
        lca: Number(counts.lca),
        perm: Number(counts.perm),
        uscis: Number(counts.uscis),
      },
      datasets: meta,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Health check failed:", err);
    res.status(200).json({
      configured: true,
      connected: false,
      error: "Database is configured but unreachable, or the schema is missing.",
    });
  }
}
