# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## Project Overview

**H1B Wage Tracker** is a client-side React + Vite single-page app that renders an
interactive county-level choropleth map of U.S. prevailing wages. A user picks an
occupation (SOC code) and enters an annual salary; the app colors each U.S. county by
which Department of Labor wage **Level (I–IV)** that salary qualifies for in that county.

- Live site: https://h1b-wage-tracker.vercel.app/ (deployed on Vercel)
- Pure frontend — there is **no backend/server**. All data is static JSON/GeoJSON served
  from `public/` and fetched at runtime.
- Data source: DOL Office of Foreign Labor Certification (OFLC) prevailing wage data.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

There is **no lint script and no `test` script** defined in `package.json` (see Caveats).

### Required environment variable

The map will not render without a Mapbox token. Create a `.env` file in the repo root:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

`.env` is gitignored. `src/utils/env.js#validateEnv()` enforces this at startup
(`src/main.jsx` and `src/hooks/useMapboxMap.js`); in production a missing token renders a
"Configuration Error" screen instead of the app.

## Tech Stack

- **React 18.3** (function components + hooks only; no class components except `ErrorBoundary`)
- **Vite 5.4** (build tool / dev server; `vite.config.js`)
- **Mapbox GL JS 3.5** (map rendering)
- **PropTypes** for runtime prop validation (project is JS, not TypeScript)
- **@vercel/analytics** for web analytics
- Plain CSS files imported per-component (no CSS-in-JS framework, no Tailwind)

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
   recomputation.
3. **`useMapboxMap`** (`src/hooks/`) initializes the Mapbox map, loads `public/counties.geojson`,
   adds `county-fill` / `county-outline` layers, and wires the county click popup. Returns
   `mapRef`, `countiesRef`, `mapLoading`, `mapError`.
4. **`useWageLevels`** computes the choropleth: it fetches the per-SOC wage table, converts the
   annual salary to hourly (`salary / 2080`, `HOURS_PER_YEAR`), assigns each county the highest
   level whose threshold the hourly wage meets, updates the GeoJSON source, and sets the
   `fill-color` paint expression. Returns `updateLevels`, `stats`, `loading`, `error`, `clearError`.

### Data model (important)

- **`public/data/soc_codes.json`** — array of `{ code, parent, title }`. `code` is the granular
  O*NET code (e.g. `11-1011.03`), `parent` is the SOC code used for the wage-data filename
  (e.g. `11-1011`). The autocomplete passes `parent` to `onSelect`.
- **`public/data/soc/{SOC}.json`** — one file per parent SOC code (~848 files). An object keyed
  by `"{STATE_ABBR}|{normalized_county}"` mapping to hourly thresholds `{ I, II, III, IV }`.
  Example: `"TX|callahan": { "I": 47.73, "II": 74.99, "III": 102.25, "IV": 129.51 }`.
- **`public/counties.geojson`** — ~9.8 MB GeoJSON of all U.S. counties. Features carry `STATEFP`
  (FIPS) and `NAME` properties.

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
public/
  counties.geojson          # U.S. county polygons (large)
  data/
    soc_codes.json          # occupation list for autocomplete
    soc/{SOC}.json          # per-occupation county→wage tables
src/
  main.jsx                  # entry point, env validation
  App.jsx                   # root: error boundary, welcome gate, admin panel
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
    icons/                  # small inline SVG icon components
    __tests__/              # component tests
  hooks/
    useMapboxMap.js         # map init + county data load
    useWageLevels.js        # wage-level computation + paint
    useDebounce.js          # generic debounce
    useLocalStorage.js      # persisted state
    useUrlState.js          # query-param–synced state
  utils/
    constants.js            # HOURS_PER_YEAR, USA_BOUNDS, wage-level colors/names
    panelConstants.js       # localStorage keys, panel constants
    currency.js             # formatCurrency / parseCurrency / validateSalary
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

Test files exist under `src/**/__tests__/` and `src/test/setup.js`, written with **Vitest** +
**@testing-library/react** + **jest-dom**. `vitest.config.js` configures a `jsdom` environment,
globals, and v8 coverage.

> **Caveat:** `package.json` does **not** declare a `test` script, and Vitest /
> @testing-library / jsdom are **not listed in `devDependencies`**. As-is, `npm test` and
> `npx vitest` will not work without first adding those dev dependencies (and ideally a
> `"test": "vitest"` script). If you add or run tests, install the missing dev deps and wire up
> the script rather than assuming the harness already exists.

## Git & Workflow

- Default branch: `main`. Active development for this task happens on the assigned feature branch.
- Commit with clear, descriptive messages; push with `git push -u origin <branch>`.
- After pushing, open a **draft** PR if one does not already exist.
- Do not commit `.env` or secrets. Note that stray `.DS_Store` files are present in the repo;
  avoid adding more.

## Deployment

Deployed to **Vercel** (`.vercel/` present) as a static build. Set `VITE_MAPBOX_TOKEN` in the
hosting platform's environment. `npm run build` emits `dist/`; the app is fully static and can
also be hosted on Netlify, GitHub Pages, etc.

## Reference Docs in Repo

`README.md` (full user/setup docs) and `IMPROVEMENTS.md`, `IMPROVEMENTS_SUMMARY.md`,
`CHANGES_IMPLEMENTED.md`, `CONTROLPANEL_IMPROVEMENTS.md` (historical refactor notes) provide
additional background.
