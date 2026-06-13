-- H1B Wage Tracker — disclosure data schema (Neon / Postgres)
--
-- Source datasets (all public, periodically released — NOT real-time):
--   * DOL OFLC LCA disclosure data  (H-1B / ETA-9035)   — quarterly
--   * DOL OFLC PERM disclosure data (ETA-9089)          — quarterly
--   * USCIS H-1B Employer Data Hub                      — annual
--
-- Apply with:  psql "$DATABASE_URL" -f db/schema.sql
-- (DATABASE_URL is provided by the Vercel Neon integration.)

-- ---------------------------------------------------------------------------
-- Employers: one row per normalized employer name, joined to all datasets.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employers (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT        NOT NULL,
  normalized_name TEXT        NOT NULL UNIQUE,
  city            TEXT,
  state           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employers_normalized ON employers (normalized_name);
CREATE INDEX IF NOT EXISTS idx_employers_state      ON employers (state);
-- Trigram index powers fast case-insensitive employer search (requires pg_trgm).
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_employers_name_trgm  ON employers USING gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- LCA filings (H-1B / H-1B1 / E-3, Form ETA-9035).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lca_filings (
  id              BIGSERIAL PRIMARY KEY,
  case_number     TEXT,
  employer_id     BIGINT REFERENCES employers (id) ON DELETE CASCADE,
  visa_class      TEXT,
  job_title       TEXT,
  soc_code        TEXT,
  soc_title       TEXT,
  full_time       BOOLEAN,
  case_status     TEXT,                 -- Certified / Denied / Withdrawn ...
  received_date   DATE,
  decision_date   DATE,
  fiscal_year     INT,
  wage_rate_from  NUMERIC(12,2),        -- offered wage (annualized)
  wage_rate_to    NUMERIC(12,2),
  prevailing_wage NUMERIC(12,2),        -- annualized prevailing wage
  pw_wage_level   TEXT,                 -- I / II / III / IV
  worksite_city   TEXT,
  worksite_county TEXT,
  worksite_state  TEXT
);

CREATE INDEX IF NOT EXISTS idx_lca_employer ON lca_filings (employer_id);
CREATE INDEX IF NOT EXISTS idx_lca_soc      ON lca_filings (soc_code);
CREATE INDEX IF NOT EXISTS idx_lca_state    ON lca_filings (worksite_state);
CREATE INDEX IF NOT EXISTS idx_lca_year     ON lca_filings (fiscal_year);
CREATE INDEX IF NOT EXISTS idx_lca_soc_state ON lca_filings (soc_code, worksite_state);

-- ---------------------------------------------------------------------------
-- PERM filings (permanent labor certification, Form ETA-9089).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perm_filings (
  id              BIGSERIAL PRIMARY KEY,
  case_number     TEXT,
  employer_id     BIGINT REFERENCES employers (id) ON DELETE CASCADE,
  job_title       TEXT,
  soc_code        TEXT,
  soc_title       TEXT,
  case_status     TEXT,                 -- Certified / Denied / Withdrawn ...
  received_date   DATE,
  decision_date   DATE,
  fiscal_year     INT,
  wage_offer      NUMERIC(12,2),        -- annualized offered wage
  pw_amount       NUMERIC(12,2),        -- annualized prevailing wage
  pw_level        TEXT,
  worksite_city   TEXT,
  worksite_state  TEXT
);

CREATE INDEX IF NOT EXISTS idx_perm_employer ON perm_filings (employer_id);
CREATE INDEX IF NOT EXISTS idx_perm_soc      ON perm_filings (soc_code);
CREATE INDEX IF NOT EXISTS idx_perm_state    ON perm_filings (worksite_state);
CREATE INDEX IF NOT EXISTS idx_perm_year     ON perm_filings (fiscal_year);

-- ---------------------------------------------------------------------------
-- USCIS H-1B Employer Data Hub (approvals / denials by fiscal year).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uscis_hub (
  id                 BIGSERIAL PRIMARY KEY,
  employer_id        BIGINT REFERENCES employers (id) ON DELETE CASCADE,
  fiscal_year        INT,
  initial_approval   INT DEFAULT 0,
  initial_denial     INT DEFAULT 0,
  continuing_approval INT DEFAULT 0,
  continuing_denial  INT DEFAULT 0,
  naics              TEXT,
  city               TEXT,
  state              TEXT,
  UNIQUE (employer_id, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_uscis_employer ON uscis_hub (employer_id);
CREATE INDEX IF NOT EXISTS idx_uscis_year     ON uscis_hub (fiscal_year);

-- ---------------------------------------------------------------------------
-- Lightweight ingestion bookkeeping so the UI can show "data as of" dates.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dataset_meta (
  dataset      TEXT PRIMARY KEY,        -- 'lca' | 'perm' | 'uscis'
  source_url   TEXT,
  period_label TEXT,                    -- e.g. 'FY2024 Q3'
  row_count    BIGINT,
  ingested_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
