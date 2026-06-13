#!/usr/bin/env node
/**
 * Disclosure-data ingestion pipeline.
 *
 * Loads public DOL OFLC and USCIS disclosure files into the Neon database
 * defined in db/schema.sql. These datasets are released periodically (DOL:
 * quarterly, USCIS: annually) — there is no real-time feed — so this is meant
 * to be re-run whenever a new release is published.
 *
 * Public sources:
 *   LCA   (H-1B / ETA-9035): https://www.dol.gov/agencies/eta/foreign-labor/performance
 *   PERM  (ETA-9089):        https://www.dol.gov/agencies/eta/foreign-labor/performance
 *   USCIS H-1B Data Hub:     https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub
 *
 * The DOL files ship as XLSX; export the sheet to CSV (or use a converter) and
 * point this script at the CSV. USCIS files are already CSV.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node db/ingest.mjs lca   path/to/LCA_FY2024.csv   "FY2024 Q3"
 *   DATABASE_URL=postgres://... node db/ingest.mjs perm  path/to/PERM_FY2024.csv  "FY2024 Q3"
 *   DATABASE_URL=postgres://... node db/ingest.mjs uscis path/to/hub_FY2024.csv   "FY2024"
 *
 * The CSV column mapping below targets the official DOL/USCIS headers; adjust
 * the COLUMN_MAPS if a future release renames columns.
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const CONNECTION =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;

if (!CONNECTION) {
  console.error("Set DATABASE_URL (Neon connection string) before running.");
  process.exit(1);
}

const sql = neon(CONNECTION);
const BATCH = 500;

/** Match the app's county/name normalization style for stable employer joins. */
const normalizeEmployer = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(inc|llc|ltd|corp|corporation|co|company|lp|llp)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Minimal RFC-4180-ish CSV parser (handles quoted fields and embedded commas). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function loadRows(path) {
  const raw = readFileSync(path, "utf8");
  const [header, ...body] = parseCsv(raw);
  const keys = header.map((h) => h.trim().toUpperCase());
  return body
    .filter((r) => r.length >= keys.length - 1 && r.some((v) => v !== ""))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const num = (v) => {
  const n = Number.parseFloat(String(v).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const intOrNull = (v) => {
  const n = Number.parseInt(String(v).replace(/[,]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};
const date = (v) => (v && /\d/.test(v) ? new Date(v).toISOString().slice(0, 10) : null);
const fyOf = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  // U.S. federal fiscal year starts Oct 1.
  return d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear();
};

/** Upsert an employer by normalized name, returning its id (memoized). */
const employerCache = new Map();
async function employerId(name, city, state) {
  const norm = normalizeEmployer(name);
  if (!norm) return null;
  if (employerCache.has(norm)) return employerCache.get(norm);
  const rows = await sql`
    INSERT INTO employers (name, normalized_name, city, state)
    VALUES (${name}, ${norm}, ${city || null}, ${state || null})
    ON CONFLICT (normalized_name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id`;
  const id = Number(rows[0].id);
  employerCache.set(norm, id);
  return id;
}

async function ingestLca(rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(async (r) => {
        const empId = await employerId(r.EMPLOYER_NAME, r.EMPLOYER_CITY, r.EMPLOYER_STATE);
        await sql`INSERT INTO lca_filings
          (case_number, employer_id, visa_class, job_title, soc_code, soc_title,
           case_status, received_date, decision_date, fiscal_year,
           wage_rate_from, prevailing_wage, pw_wage_level,
           worksite_city, worksite_county, worksite_state)
          VALUES (${r.CASE_NUMBER}, ${empId}, ${r.VISA_CLASS}, ${r.JOB_TITLE},
                  ${r.SOC_CODE}, ${r.SOC_TITLE}, ${r.CASE_STATUS},
                  ${date(r.RECEIVED_DATE)}, ${date(r.DECISION_DATE)},
                  ${fyOf(r.RECEIVED_DATE)}, ${num(r.WAGE_RATE_OF_PAY_FROM)},
                  ${num(r.PREVAILING_WAGE)}, ${r.PW_WAGE_LEVEL},
                  ${r.WORKSITE_CITY}, ${r.WORKSITE_COUNTY}, ${r.WORKSITE_STATE})`;
      })
    );
    process.stdout.write(`\r  LCA: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function ingestPerm(rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(async (r) => {
        const empId = await employerId(r.EMPLOYER_NAME, r.EMPLOYER_CITY, r.EMPLOYER_STATE);
        await sql`INSERT INTO perm_filings
          (case_number, employer_id, job_title, soc_code, soc_title, case_status,
           received_date, decision_date, fiscal_year, wage_offer, pw_amount,
           pw_level, worksite_city, worksite_state)
          VALUES (${r.CASE_NUMBER}, ${empId}, ${r.JOB_TITLE}, ${r.PW_SOC_CODE},
                  ${r.PW_SOC_TITLE}, ${r.CASE_STATUS}, ${date(r.RECEIVED_DATE)},
                  ${date(r.DECISION_DATE)}, ${fyOf(r.RECEIVED_DATE)},
                  ${num(r.WAGE_OFFER_FROM)}, ${num(r.PW_AMOUNT)}, ${r.PW_LEVEL},
                  ${r.WORKSITE_CITY}, ${r.WORKSITE_STATE})`;
      })
    );
    process.stdout.write(`\r  PERM: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function ingestUscis(rows) {
  for (const r of rows) {
    const empId = await employerId(r.EMPLOYER, r.CITY, r.STATE);
    if (!empId) continue;
    await sql`INSERT INTO uscis_hub
      (employer_id, fiscal_year, initial_approval, initial_denial,
       continuing_approval, continuing_denial, naics, city, state)
      VALUES (${empId}, ${intOrNull(r["FISCAL_YEAR"] || r["FISCAL YEAR"])},
              ${intOrNull(r["INITIAL_APPROVAL"] || r["INITIAL APPROVAL"])},
              ${intOrNull(r["INITIAL_DENIAL"] || r["INITIAL DENIAL"])},
              ${intOrNull(r["CONTINUING_APPROVAL"] || r["CONTINUING APPROVAL"])},
              ${intOrNull(r["CONTINUING_DENIAL"] || r["CONTINUING DENIAL"])},
              ${r.NAICS || null}, ${r.CITY || null}, ${r.STATE || null})
      ON CONFLICT (employer_id, fiscal_year) DO NOTHING`;
  }
  console.log(`  USCIS: ${rows.length} rows`);
}

async function main() {
  const [dataset, path, period] = process.argv.slice(2);
  if (!dataset || !path) {
    console.error("Usage: node db/ingest.mjs <lca|perm|uscis> <file.csv> [period]");
    process.exit(1);
  }
  console.log(`Loading ${path} ...`);
  const rows = loadRows(path);
  console.log(`Parsed ${rows.length} rows; ingesting "${dataset}"`);

  if (dataset === "lca") await ingestLca(rows);
  else if (dataset === "perm") await ingestPerm(rows);
  else if (dataset === "uscis") await ingestUscis(rows);
  else { console.error(`Unknown dataset: ${dataset}`); process.exit(1); }

  await sql`INSERT INTO dataset_meta (dataset, period_label, row_count, ingested_at)
            VALUES (${dataset}, ${period || null}, ${rows.length}, now())
            ON CONFLICT (dataset) DO UPDATE
              SET period_label = EXCLUDED.period_label,
                  row_count    = EXCLUDED.row_count,
                  ingested_at  = now()`;
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
