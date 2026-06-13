/**
 * Deep-linking helpers for the Data Explorer.
 *
 * The explorer's open state and active tab are encoded in the URL so a view can
 * be shared (e.g. `?view=explorer&tab=perm`). These coexist with the map's
 * `?soc=` / `?salary=` params — each helper preserves the other keys.
 */

const VALID_TABS = ["overview", "employers", "perm", "wages", "uscis"];

// Explorer filter params are prefixed `f_` so they never collide with the
// map's own `?soc=` / `?salary=` query params.
const FILTER_PREFIX = "f_";
const VALID_FILTERS = ["state", "soc", "salary", "employer"];

/** Read the explorer state from the current URL. */
export function readExplorerUrl() {
  if (typeof window === "undefined") return { open: false, tab: "overview" };
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  return {
    open: params.get("view") === "explorer",
    tab: VALID_TABS.includes(tab) ? tab : "overview",
  };
}

/** Write open state + tab to the URL via replaceState (preserves other params). */
export function writeExplorerUrl({ open, tab }) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (open) {
    params.set("view", "explorer");
    if (tab && VALID_TABS.includes(tab)) params.set("tab", tab);
  } else {
    params.delete("view");
    params.delete("tab");
    // Closing the explorer clears its filter params too
    VALID_FILTERS.forEach((f) => params.delete(`${FILTER_PREFIX}${f}`));
  }
  const qs = params.toString();
  window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

/** Read a single explorer filter value from the URL (empty string if unset). */
export function readFilter(name) {
  if (typeof window === "undefined" || !VALID_FILTERS.includes(name)) return "";
  const params = new URLSearchParams(window.location.search);
  return params.get(`${FILTER_PREFIX}${name}`) ?? "";
}

/** Write a single explorer filter value to the URL (preserves other params). */
export function writeFilter(name, value) {
  if (typeof window === "undefined" || !VALID_FILTERS.includes(name)) return;
  const params = new URLSearchParams(window.location.search);
  const key = `${FILTER_PREFIX}${name}`;
  if (value === null || value === undefined || value === "") params.delete(key);
  else params.set(key, String(value));
  const qs = params.toString();
  window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

export { VALID_TABS, VALID_FILTERS };
