# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## Project Overview

**H1B Wage Tracker** is a client-side React + Vite single-page app that renders an
interactive county-level choropleth map of U.S. prevailing wages. A user picks an
occupation (SOC code) and enters an annual salary; the app colors each U.S. county by
which Department of Labor wage **Level (I–IV)** that salary qualifies for in that county.

- Live site: https://h1b-wage-tracker.vercel.app/ (deployed on Vercel)
- The **wage map** is pure frontend — static JSON/GeoJSON served from `public/`, fetched at
  runtime, no server required.
- A second feature, the **Data Explorer** (LCA / PERM / USCIS disclosure data), is backed by
  **Vercel serverless functions** (`api/`) over a **Neon Postgres** database. It degrades
  gracefully to clearly-labeled sample data when the database isn't configured, so the static
  app still works without a backend.
- Data sources: DOL OFLC prevailing wage data (map); DOL OFLC LCA/PERM disclosure files +
  USCIS H-1B Employer Data Hub (explorer). All are periodic public releases — **not real-time**.

## Commands

```bash
npm install            # install dependencies
npm run dev            # start Vite dev server (http://localhost:5173)
npm run build          # production build → dist/
npm run preview        # preview the production build locally
npm test               # run the Vitest suite once
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # Vitest with v8 coverage

# Disclosure-data ingestion (requires DATABASE_URL; see Data Explorer below)
psql "$DATABASE_URL" -f db/schema.sql                      # create tables
node db/ingest.mjs lca   path/to/LCA.csv  "FY2024 Q3" # load LCA filings
node db/ingest.mjs perm  path/to/PERM.csv "FY2024 Q3" # load PERM filings
node db/ingest.mjs uscis path/to/hub.csv  "FY2024"    # load USCIS hub
```

There is **no lint script** defined in `package.json`.

### Environment variables

| Variable            | Required?              | Purpose                                                        |
| ------------------- | ---------------------- | -------------------------------------------------------------- |
| `VITE_MAPBOX_TOKEN` | **Yes** (for the map)  | Mapbox GL token. Missing → "Configuration Error" screen.       |
| `DATABASE_URL`      | No (explorer fallback) | Neon Postgres connection. Set by the Vercel Neon integration.  |

Copy `.env.example` → `.env` (gitignored). `src/utils/env.js#validateEnv()` enforces the Mapbox
token at startup (`src/main.jsx`, `src/hooks/useMapboxMap.js`); in production a missing token
renders a "Configuration Error" screen. The API helper `api/_db.js` reads `DATABASE_URL` (and the
`POSTGRES_URL` / `*_UNPOOLED` aliases the Vercel Neon integration may set); when absent, API routes
return `{ configured: false }` and the Data Explorer shows sample data.

## Tech Stack

- **React 18.3** (function components + hooks only; no class components except `ErrorBoundary`)
- **Vite 5.4** (build tool / dev server; `vite.config.js` — splits `mapbox-gl` and `react` into
  separate vendor chunks via `manualChunks` for better caching)
- **Vitest + @testing-library/react + jest-dom + jsdom** (test harness; `vitest.config.js`)
- **Mapbox GL JS 3.5** (map rendering)
- **Vercel serverless functions** (`api/*.js`, Node runtime) for the Data Explorer API
- **Neon Postgres** via **@neondatabase/serverless** (HTTP driver, edge-friendly)
- **PropTypes** for runtime prop validation (project is JS, not TypeScript)
- **@vercel/analytics** for web analytics
- Plain CSS files imported per-component (no CSS-in-JS framework, no Tailwind). No chart library —
  the explorer uses lightweight CSS bar charts (`components/explorer/primitives.jsx`).

## Architecture & Data Flow

```
main.jsx → App.jsx → Map.jsx
                       ├─ useMapboxMap()   → fetches /counties.geojson, builds the map
                       ├─ useWageLevels()  → fetches /data/soc/{SOC}.json, computes levels
                       └─ ControlPanel     → occupation search + salary input + stats + legend
```

1. **`App.jsx`** wraps everything in `ErrorBoundary` + `Analytics`. It gates the app behind a
   `WelcomeModal` (first visit, tracked in localStorage via `utils/userTracking.js`) and exposes
   a hidden **AdminPanel** toggled with `Ctrl/Cmd+Shift+A`.
2. **`Map.jsx`** is the orchestrator. It holds the core state: `soc`, `socText`, `salary`,
   and `showEducationModal`. Salary is debounced (300ms via `useDebounce`) before triggering
   recomputation. The current view is **shareable**: `?soc=` and `?salary=` query params are
   restored on load (SOC codes are validated against `##-####` before being used in fetch
   paths) and kept in sync via `history.replaceState` (debounced salary, so no per-keystroke
   URL writes).
3. **`useMapboxMap`** (`src/hooks/`) initializes the Mapbox map, loads `public/counties.geojson`,
   adds `county-fill` / `county-outline` layers, and wires the county click popup. Returns
   `mapRef`, `countiesRef`, `mapLoading`, `mapError`.
4. **`useWageLevels`** computes the choropleth: it fetches the per-SOC wage table, converts the
   annual salary to hourly (`salary / 2080`, `HOURS_PER_YEAR`), assigns each county the highest
   level whose threshold the hourly wage meets, updates the GeoJSON source, and sets the
   `fill-color` paint expression. Returns `updateLevels`, `stats`, `loading`, `error`, `clearError`.
   It also attaches annual threshold properties (`wageI`–`wageIV`) to each matched feature; the
   county click popup in `useMapboxMap` renders these as a Level I–IV threshold table.
5. **`App.jsx`** also renders a floating **Data Explorer** launch button and the
   `DataExplorer` overlay (see below) — a separate, backend-powered feature layered over the map.

### Data Explorer (LCA / PERM / USCIS)

A full-screen overlay (`src/components/explorer/DataExplorer.jsx`) with six tabs —
**Overview, Employers, Occupations, PERM, Salary Insights, USCIS Approvals** — over DOL/USCIS
disclosure data.

```
DataExplorer (overlay, tab nav)
  ├─ OverviewTab    → /api/overview    (totals, top states)
  ├─ EmployerTab    → /api/employers   → /api/employer?id=  (search → profile)
  ├─ OccupationTab  → /api/occupation  (SOC pivot: sponsors, wage trend, geography)
  ├─ PermTab        → /api/perm        (PERM aggregates, filters: state/soc)
  ├─ WagesTab       → /api/wages       (filed-wage percentiles, salary ranking)
  └─ UscisTab       → /api/uscis       (approvals/denials, approval rate)
```

- **API client**: `src/utils/api.js#fetchData(endpoint, params)` returns `{ data, source }`.
  `source` is `"live"` (Neon-backed) or `"sample"` (API unconfigured/unreachable → falls back to
  `src/data/sampleData.js`, shown with a visible **Sample data** banner so synthetic numbers are
  never passed off as real). `src/components/explorer/useExplorerData.js` wraps it as a hook and
  reports the source up to the overlay.
- **Serverless API** (`api/*.js`, Vercel Node functions): each route wraps its handler with
  `withDb()` from `api/_db.js`, which injects the Neon `sql` client, sets edge-cache headers,
  and short-circuits to `{ configured: false }` when no `DATABASE_URL` is set. Queries use Neon
  tagged-template interpolation (parameterized — injection-safe). Files prefixed `_` (e.g.
  `_db.js`) are **not** exposed as routes.
- **No chart library**: visuals are CSS bar charts / stat cards in
  `src/components/explorer/primitives.jsx` (which also exports `ExportButton` and `FreshnessBadge`),
  plus dependency-free SVG trend lines for year-over-year series
  (`components/explorer/LineChart.jsx`; pure geometry in `src/utils/chart.js`).
- **Deep-linkable**: open state + active tab are encoded in the URL (`?view=explorer&tab=perm`) via
  `src/utils/explorerUrl.js` and restored on load — shareable alongside the map's `?soc=&salary=`.
  Tab filters are also deep-linked, **namespaced `f_`** (`f_state`, `f_soc`, `f_salary`,
  `f_employer`) so they never collide with the map's `soc`/`salary`. PERM & Salary tabs bind their
  filters via `components/explorer/useUrlFilter.js`.
- **Map → Explorer bridge**: a county popup button dispatches a `window` `"explorer:open"`
  CustomEvent (`{ tab, state }`); `App.jsx` listens, writes the URL (tab + `f_state`), and opens the
  explorer. `DataExplorer` re-reads the active tab from the URL on each open so the bridge/deep
  links land on the right tab.
- **CSV export**: tab tables export via `src/utils/csv.js` (`toCsv` / `downloadCsv`).
- **Freshness**: the header `FreshnessBadge` shows "data as of" labels from `dataset_meta`
  (via `/api/overview` `meta`).

### Data model (important)

- **`public/data/soc_codes.json`** — array of `{ code, parent, title }`. `code` is the granular
  O*NET code (e.g. `11-1011.03`), `parent` is the SOC code used for the wage-data filename
  (e.g. `11-1011`). The autocomplete passes `parent` to `onSelect`.
- **`public/data/soc/{SOC}.json`** — one file per parent SOC code (~848 files). An object keyed
  by `"{STATE_ABBR}|{normalized_county}"` mapping to hourly thresholds `{ I, II, III, IV }`.
  Example: `"TX|callahan": { "I": 47.73, "II": 74.99, "III": 102.25, "IV": 129.51 }`.
- **`public/counties.geojson`** — ~9.8 MB GeoJSON of all U.S. counties. Features carry `STATEFP`
  (FIPS) and `NAME` properties.

**Disclosure database (`db/schema.sql`)** — Postgres tables for the Data Explorer:
`employers` (deduped by `normalized_name`, joined to everything), `lca_filings` (H-1B/ETA-9035),
`perm_filings` (ETA-9089), `uscis_hub` (USCIS approvals/denials by FY), and `dataset_meta`
("data as of" bookkeeping). Populated by `db/ingest.mjs` from official DOL/USCIS CSVs — adjust
the script's `COLUMN_MAPS`/field references if a future release renames columns.

### The county-matching key (do not break this)

County lookup joins GeoJSON features to wage data via a composite key built in
`useWageLevels.js`:

```js
const state = STATE_FP_TO_ABBR[f.properties.STATEFP];        // FIPS → "TX"
const key = `${state}|${normalize(`${f.properties.NAME} County`)}`;
```

`normalize()` (`src/utils/normalize.js`) lowercases, strips the literal `" county"`, and
collapses whitespace. The wage-data preprocessing that generates the SOC JSON files **must use
the same normalization**, or counties silently fall through to "no data" (gray). If you change
`normalize`, the data files must be regenerated to match.

## Directory Layout

```
api/                        # Vercel serverless functions (Data Explorer API)
  _db.js                    # Neon client + withDb() wrapper (not a route)
  overview.js employers.js employer.js occupation.js perm.js wages.js uscis.js
db/
  schema.sql                # Postgres schema for disclosure data
scripts/
  ingest.mjs                # DOL/USCIS CSV → Neon ingestion pipeline
public/
  counties.geojson          # U.S. county polygons (large)
  data/
    soc_codes.json          # occupation list for autocomplete
    soc/{SOC}.json          # per-occupation county→wage tables
src/
  main.jsx                  # entry point, env validation
  App.jsx                   # root: error boundary, welcome gate, admin panel, Data Explorer
  Map.jsx / Map.css         # orchestrator + map container styles
  SocAutocomplete.jsx       # occupation search dropdown (fetches soc_codes.json)
  stateFpToAbbr.js          # FIPS code → state abbreviation map
  index.css                 # global styles
  data/
    sampleData.js           # illustrative explorer fallback data (synthetic)
  components/               # UI components (PropTypes-validated)
    ControlPanel.jsx        # composed of PanelHeader/PanelContent/PanelFooter
    StatisticsPanel.jsx, Legend.jsx, SalaryInput.jsx, OccupationSelector.jsx
    ErrorBoundary.jsx, ErrorMessage.jsx, LoadingIndicator.jsx
    WelcomeModal.jsx, EducationModal.jsx, AdminPanel.jsx
    education/              # educational content components (FAQ, explainers)
    explorer/              # Data Explorer overlay, tabs, hook, primitives, CSS
    icons/                  # small inline SVG icon components
    __tests__/              # component tests
  hooks/
    useMapboxMap.js         # map init + county data load
    useWageLevels.js        # wage-level computation + paint
    useDebounce.js          # generic debounce
    useLocalStorage.js      # persisted state
    useUrlState.js          # generic query-param state (currently unused; Map.jsx syncs URL directly)
    __tests__/              # hook tests
  utils/
    constants.js            # HOURS_PER_YEAR, USA_BOUNDS, wage-level colors/names
    panelConstants.js       # localStorage keys, panel constants
    currency.js             # formatCurrency / parseCurrency / validateSalary
    format.js               # explorer display formatting (compact/USD/pct/ordinal)
    api.js                  # Data Explorer fetch client + sample fallback
    csv.js                  # CSV serialize + browser download
    explorerUrl.js          # explorer deep-link (?view=&tab=) read/write
    normalize.js            # county-name normalization (see above)
    env.js                  # env var validation
    userTracking.js         # localStorage user/session tracking + admin exports
    locationData.js, userTracking.js
    __tests__/              # util tests
```

## Conventions

- **Components**: function components with hooks. Default export per file. Public components
  declare `propTypes`; keep them accurate when changing props.
- **Hooks**: live in `src/hooks/`, named `useX.js`, return a single object or tuple. Memoize
  callbacks with `useCallback` and derived values with `useMemo` (existing code does this
  consistently for render performance).
- **Constants**: centralize shared values in `src/utils/constants.js` /
  `src/utils/panelConstants.js`. Wage-level colors exist in two shapes — `WAGE_LEVEL_COLORS`
  (popup, keyed incl. `default`) and `MAP_PAINT_COLORS` (Mapbox paint expression). Keep them in
  sync if you change the palette.
- **Styling**: per-component `.css` files imported into the component (e.g. `AdminPanel.css`).
  Some components use inline styles for one-offs. Responsive breakpoints: mobile `<768px`,
  tablet `768–1024px`, desktop `>1024px`.
- **Module type**: `package.json` is `"type": "module"` — use ESM `import`/`export` everywhere.
- **Security**: the county popup builds HTML via `setHTML`; county/state values come from the
  trusted GeoJSON, but keep interpolated values constrained to known data when editing.

## Testing

Tests live under `src/**/__tests__/` with shared setup in `src/test/setup.js`, written with
**Vitest** + **@testing-library/react** + **jest-dom**. `vitest.config.js` configures a `jsdom`
environment, globals, and v8 coverage. Run with `npm test` (or `test:watch` / `test:coverage`).

Notes for writing tests:
- jsdom does not implement `scrollIntoView`; stub it (`Element.prototype.scrollIntoView = vi.fn()`)
  when testing components that use it (e.g. `SocAutocomplete`).
- Components that fetch (e.g. `SocAutocomplete`) are tested by stubbing `fetch` via
  `vi.stubGlobal` — see `src/components/__tests__/SocAutocomplete.test.jsx`.

## Git & Workflow

- Default branch: `main`. Active development for this task happens on the assigned feature branch.
- Commit with clear, descriptive messages; push with `git push -u origin <branch>`.
- After pushing, open a **draft** PR if one does not already exist.
- Do not commit `.env` or secrets. Note that stray `.DS_Store` files are present in the repo;
  avoid adding more.

## Deployment

Deployed to **Vercel** (`.vercel/` present). `npm run build` emits the static `dist/`; Vercel also
auto-deploys each file in `api/` as a Node serverless function (no `vercel.json` needed). Set
`VITE_MAPBOX_TOKEN` in the hosting environment. For the Data Explorer, add the **Neon integration**
(Vercel dashboard → Storage → Neon) which provisions `DATABASE_URL`; then apply `db/schema.sql` and
run `db/ingest.mjs` to load data. Without Neon, the explorer shows sample data and the rest of
the app is unaffected. The static map alone can also be hosted on Netlify / GitHub Pages (the API
routes require a serverless host like Vercel).

## Reference Docs in Repo

`README.md` (full user/setup docs) and `IMPROVEMENTS.md`, `IMPROVEMENTS_SUMMARY.md`,
`CHANGES_IMPLEMENTED.md`, `CONTROLPANEL_IMPROVEMENTS.md` (historical refactor notes) provide
additional background.
