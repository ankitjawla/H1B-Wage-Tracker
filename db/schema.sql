-- H1B Wage Tracker — disclosure data schema (Supabase / Postgres)
--
-- This mirrors the migration applied to the live Supabase project. Objects live
-- in a dedicated `h1b` schema so they stay isolated from anything else in the
-- database. The Data Explorer reads this data ONLY through the read-only RPC
-- functions in db/rpc.sql (public.h1b_*), which are the surface exposed to the
-- browser via the publishable key.
--
-- Sources (periodic public releases — NOT real-time):
--   * DOL OFLC LCA disclosure data  (H-1B / ETA-9035)   — quarterly
--   * DOL OFLC PERM disclosure data (ETA-9089)          — quarterly
--   * USCIS H-1B Employer Data Hub                      — annual
--
-- Apply with:  psql "$SUPABASE_DB_URL" -f db/schema.sql

CREATE SCHEMA IF NOT EXISTS h1b;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS h1b.employers (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  city            TEXT,
  state           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_h1b_employers_state ON h1b.employers (state);
CREATE INDEX IF NOT EXISTS idx_h1b_employers_name_trgm ON h1b.employers USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS h1b.lca_filings (
  id              BIGSERIAL PRIMARY KEY,
  case_number     TEXT,
  employer_id     BIGINT REFERENCES h1b.employers (id) ON DELETE CASCADE,
  visa_class      TEXT,
  job_title       TEXT,
  soc_code        TEXT,
  soc_title       TEXT,
  case_status     TEXT,
  received_date   DATE,
  decision_date   DATE,
  fiscal_year     INT,
  wage_rate_from  NUMERIC(12,2),
  prevailing_wage NUMERIC(12,2),
  pw_wage_level   TEXT,
  worksite_city   TEXT,
  worksite_county TEXT,
  worksite_state  TEXT
);
CREATE INDEX IF NOT EXISTS idx_h1b_lca_employer ON h1b.lca_filings (employer_id);
CREATE INDEX IF NOT EXISTS idx_h1b_lca_soc      ON h1b.lca_filings (soc_code);
CREATE INDEX IF NOT EXISTS idx_h1b_lca_state    ON h1b.lca_filings (worksite_state);
CREATE INDEX IF NOT EXISTS idx_h1b_lca_year     ON h1b.lca_filings (fiscal_year);

CREATE TABLE IF NOT EXISTS h1b.perm_filings (
  id              BIGSERIAL PRIMARY KEY,
  case_number     TEXT,
  employer_id     BIGINT REFERENCES h1b.employers (id) ON DELETE CASCADE,
  job_title       TEXT,
  soc_code        TEXT,
  soc_title       TEXT,
  case_status     TEXT,
  received_date   DATE,
  decision_date   DATE,
  fiscal_year     INT,
  wage_offer      NUMERIC(12,2),
  pw_amount       NUMERIC(12,2),
  pw_level        TEXT,
  worksite_city   TEXT,
  worksite_state  TEXT
);
CREATE INDEX IF NOT EXISTS idx_h1b_perm_employer ON h1b.perm_filings (employer_id);
CREATE INDEX IF NOT EXISTS idx_h1b_perm_soc      ON h1b.perm_filings (soc_code);
CREATE INDEX IF NOT EXISTS idx_h1b_perm_state    ON h1b.perm_filings (worksite_state);
CREATE INDEX IF NOT EXISTS idx_h1b_perm_year     ON h1b.perm_filings (fiscal_year);

CREATE TABLE IF NOT EXISTS h1b.uscis_hub (
  id                  BIGSERIAL PRIMARY KEY,
  employer_id         BIGINT REFERENCES h1b.employers (id) ON DELETE CASCADE,
  fiscal_year         INT,
  initial_approval    INT DEFAULT 0,
  initial_denial      INT DEFAULT 0,
  continuing_approval INT DEFAULT 0,
  continuing_denial   INT DEFAULT 0,
  naics               TEXT,
  city                TEXT,
  state               TEXT,
  UNIQUE (employer_id, fiscal_year)
);
CREATE INDEX IF NOT EXISTS idx_h1b_uscis_employer ON h1b.uscis_hub (employer_id);
CREATE INDEX IF NOT EXISTS idx_h1b_uscis_year     ON h1b.uscis_hub (fiscal_year);

CREATE TABLE IF NOT EXISTS h1b.dataset_meta (
  dataset      TEXT PRIMARY KEY,
  source_url   TEXT,
  period_label TEXT,
  row_count    BIGINT,
  ingested_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
