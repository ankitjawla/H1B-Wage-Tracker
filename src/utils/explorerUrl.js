/**
 * Deep-linking helpers for the Data Explorer.
 *
 * The explorer's open state and active tab are encoded in the URL so a view can
 * be shared (e.g. `?view=explorer&tab=perm`). These coexist with the map's
 * `?soc=` / `?salary=` params — each helper preserves the other keys.
 */

const VALID_TABS = ["overview", "employers", "perm", "wages", "uscis"];

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
  }
  const qs = params.toString();
  window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

export { VALID_TABS };
