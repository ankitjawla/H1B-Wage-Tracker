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
- A second feature, the **Data Explorer** (LCA / PERM / USCIS disclosure data), reads **real data
  directly from Supabase Postgres** via read-only PostgREST RPC functions (`public.h1b_*`) using
  the public *publishable* key — no Vercel serverless functions, no server secret. There is **no
  synthetic/sample data**: if the database is unreachable the UI says "Data unavailable" rather
  than show fabricated numbers.
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

# Disclosure-data ingestion (Supabase Postgres; SUPABASE_DB_URL = project Postgres URL)
psql "$SUPABASE_DB_URL" -f db/schema.sql                  # create the h1b schema + tables
psql "$SUPABASE_DB_URL" -f db/rpc.sql                     # create the read-only RPC functions
node db/ingest.mjs lca   path/to/LCA.csv  "FY2024 Q3" # load LCA filings
node db/ingest.mjs perm  path/to/PERM.csv "FY2024 Q3" # load PERM filings
node db/ingest.mjs uscis path/to/hub.csv  "FY2024"    # load USCIS hub
```

There is **no lint script** defined in `package.json`.

### Environment variables

| Variable                 | Required?             | Purpose                                                              |
| ------------------------ | --------------------- | -------------------------------------------------------------------- |
| `VITE_MAPBOX_TOKEN`      | **Yes** (for the map) | Mapbox GL token. Missing → "Configuration Error" screen.             |
| `VITE_SUPABASE_URL`      | No (defaults baked)   | Supabase project URL for the Data Explorer.                          |
| `VITE_SUPABASE_ANON_KEY` | No (defaults baked)   | Supabase **publishable** key (public/browser-safe; read-only RPCs).  |
| `SUPABASE_DB_URL`        | Ingestion only        | Postgres connection string used by `db/ingest.mjs` on a real machine.|

`src/utils/env.js#validateEnv()` enforces the Mapbox token at startup. The Supabase URL + publishable
key are committed defaults in `src/utils/supabase.js` (the publishable key is **not** a secret), so the
Data Explorer works on the static deploy with no server env. Override them with the `VITE_*` vars if
pointing at a different project.

## Tech Stack

- **React 18.3** (function components + hooks only; no class components except `ErrorBoundary`)
- **Vite 5.4** (build tool / dev server; `vite.config.js` — splits `mapbox-gl` and `react` into
  separate vendor chunks via `manualChunks` for better caching)
- **Vitest + @testing-library/react + jest-dom + jsdom** (test harness; `vitest.config.js`)
- **Mapbox GL JS 3.5** (map rendering)
- **Supabase Postgres** for the Data Explorer — read directly from the browser via PostgREST RPC
  (`public.h1b_*` functions) with the publishable key. No serverless functions, no Neon.
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
  ├─ OverviewTab    → rpc h1b_overview    (totals, top states)
  ├─ EmployerTab    → rpc h1b_employers   → h1b_employer  (search → profile; compare up to 3)
  ├─ OccupationTab  → rpc h1b_occupation  (SOC pivot: sponsors, wage trend, geography)
  ├─ PermTab        → rpc h1b_perm        (PERM aggregates, filters: state/soc)
  ├─ WagesTab       → rpc h1b_wages       (filed-wage percentiles, salary ranking)
  └─ UscisTab       → rpc h1b_uscis       (approvals/denials, approval rate)
```

- **API client**: `src/utils/api.js#fetchData(endpoint, params)` maps each endpoint to a Supabase
  RPC (`src/utils/supabase.js#callRpc`) and returns `{ data, source }`. `source` is `"live"` or
  `"unavailable"` (request failed → empty shape + a "Data unavailable" banner; **never** synthetic
  data). `src/components/explorer/useExplorerData.js` wraps it as a hook and reports the source up.
- **Database**: a dedicated `h1b` schema (tables in `db/schema.sql`) read via SECURITY DEFINER
  RPC functions in `public` (`db/rpc.sql`), granted to the `anon` role. Only the aggregate RPCs are
  exposed — raw tables are not. Queries are parameterized (injection-safe).
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
- **Accessibility**: the overlay is a focus-trapped `role="dialog"` (Tab cycles within it, focus
  restores to the opener on close, body scroll locks). Tabs follow the WAI-ARIA tabs pattern
  (`tablist`/`tab`/`tabpanel`, roving `tabIndex`, Arrow/Home/End navigation). Loading states use
  the `ExplorerLoading` skeleton (respects `prefers-reduced-motion`).
- **CSV export**: tab tables export via `src/utils/csv.js` (`toCsv` / `downloadCsv`).
- **Freshness**: the header `FreshnessBadge` shows "data as of" labels from `dataset_meta`
  (via the `h1b_overview` `meta`). A **Live/Unavailable status pill** reflects whether the database
  responded. The `h1b_health()` RPC reports `{ counts, datasets }` for verifying ingestion.

### Data model (important)

- **`public/data/soc_codes.json`** — array of `{ code, parent, title }`. `code` is the granular
  O*NET code (e.g. `11-1011.03`), `parent` is the SOC code used for the wage-data filename
  (e.g. `11-1011`). The autocomplete passes `parent` to `onSelect`.
- **`public/data/soc/{SOC}.json`** — one file per parent SOC code (~848 files). An object keyed
  by `"{STATE_ABBR}|{normalized_county}"` mapping to hourly thresholds `{ I, II, III, IV }`.
  Example: `"TX|callahan": { "I": 47.73, "II": 74.99, "III": 102.25, "IV": 129.51 }`.
- **`public/counties.geojson`** — ~9.8 MB GeoJSON of all U.S. counties. Features carry `STATEFP`
  (FIPS) and `NAME` properties.

**Disclosure database (`db/schema.sql`, `h1b` schema in Supabase)** — `employers` (deduped by
`normalized_name`), `lca_filings` (H-1B/ETA-9035), `perm_filings` (ETA-9089), `uscis_hub` (USCIS
approvals/denials by FY), and `dataset_meta` ("data as of" bookkeeping). Read only through the
`public.h1b_*` RPC functions (`db/rpc.sql`). Populated by `db/ingest.mjs` from official DOL/USCIS
CSVs — adjust the script's field references if a future release renames columns.

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
db/
  schema.sql                # h1b schema + tables (Supabase Postgres)
  rpc.sql                   # read-only public.h1b_* RPC functions (anon-exposed)
  ingest.mjs                # DOL/USCIS CSV → Supabase ingestion (real-machine full loads)
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
    supabase.js             # Supabase URL + publishable key + callRpc()
    api.js                  # Data Explorer fetch client (endpoint → RPC; no sample data)
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

Deployed to **Vercel** (`.vercel/` present) as a fully static build — `npm run build` emits `dist/`;
there are no serverless functions. Set `VITE_MAPBOX_TOKEN` in the hosting environment. The Data
Explorer talks to **Supabase** directly from the browser using the committed publishable key, so no
server secret is required and it works on any static host (Netlify, GitHub Pages, etc.). To load/refresh
data: apply `db/schema.sql` + `db/rpc.sql` to the Supabase project, then run `db/ingest.mjs` with
`SUPABASE_DB_URL` against the official DOL/USCIS files.

## Reference Docs in Repo

`README.md` (full user/setup docs) and `IMPROVEMENTS.md`, `IMPROVEMENTS_SUMMARY.md`,
`CHANGES_IMPLEMENTED.md`, `CONTROLPANEL_IMPROVEMENTS.md` (historical refactor notes) provide
additional background.
