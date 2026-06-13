import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import CloseIcon from "../icons/CloseIcon";
import { UnavailableBanner, FreshnessBadge } from "./primitives";
import { useExplorerData } from "./useExplorerData";
import { readExplorerUrl, writeExplorerUrl } from "../../utils/explorerUrl";
import OverviewTab from "./OverviewTab";
import EmployerTab from "./EmployerTab";
import OccupationTab from "./OccupationTab";
import PermTab from "./PermTab";
import WagesTab from "./WagesTab";
import UscisTab from "./UscisTab";
import "./DataExplorer.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "employers", label: "Employers" },
  { id: "occupations", label: "Occupations" },
  { id: "perm", label: "PERM" },
  { id: "wages", label: "Salary Insights" },
  { id: "uscis", label: "USCIS Approvals" },
];

const TAB_COMPONENTS = {
  overview: OverviewTab,
  employers: EmployerTab,
  occupations: OccupationTab,
  perm: PermTab,
  wages: WagesTab,
  uscis: UscisTab,
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen Data Explorer overlay for LCA / PERM / USCIS disclosure data.
 * @param {boolean} isOpen
 * @param {Function} onClose
 */
export default function DataExplorer({ isOpen, onClose }) {
  // Restore active tab from the URL (?tab=) for shareable deep links
  const [active, setActive] = useState(() => readExplorerUrl().tab);
  const [source, setSource] = useState("live");
  const overlayRef = useRef(null);
  const restoreFocusRef = useRef(null);

  // Lightweight overview fetch purely for the header "data as of" badge
  const { data: overview } = useExplorerData("overview", {}, undefined, isOpen);

  // Keep the URL in sync with the active tab while the explorer is open
  const selectTab = useCallback((tab) => {
    setActive(tab);
    writeExplorerUrl({ open: true, tab });
  }, []);

  // Re-sync the active tab from the URL each time the explorer opens, so deep
  // links and the map→explorer bridge (which set ?tab=) land on the right tab.
  useEffect(() => {
    if (isOpen) setActive(readExplorerUrl().tab);
  }, [isOpen]);

  // Lock body scroll and manage focus while the overlay is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    restoreFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the overlay on open
    const id = window.setTimeout(() => {
      overlayRef.current?.querySelector('[role="tab"][aria-selected="true"]')?.focus();
    }, 0);

    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      // Restore focus to whatever opened the explorer
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Escape to close + a simple focus trap (Tab cycles within the overlay).
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = overlayRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const list = Array.from(nodes).filter((n) => n.offsetParent !== null);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Arrow-key navigation across the tablist (WAI-ARIA tabs pattern).
  const onTabKeyDown = useCallback(
    (e) => {
      const idx = TABS.findIndex((t) => t.id === active);
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % TABS.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + TABS.length) % TABS.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = TABS.length - 1;
      else return;
      e.preventDefault();
      selectTab(TABS[next].id);
      overlayRef.current?.querySelector(`#explorer-tab-${TABS[next].id}`)?.focus();
    },
    [active, selectTab]
  );

  // Each tab reports whether it rendered live or sample data
  const handleSource = useCallback((s) => setSource(s), []);

  if (!isOpen) return null;

  const TabBody = TAB_COMPONENTS[active];

  return (
    <div
      className="explorer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="H1B data explorer"
      ref={overlayRef}
    >
      <header className="explorer-header">
        <div className="explorer-title">
          <span className="explorer-logo" aria-hidden="true">📊</span>
          <div>
            <h2>H1B / PERM Data Explorer</h2>
            <p>LCA, PERM &amp; USCIS disclosure data for applicants, employees &amp; employers</p>
          </div>
        </div>
        <div className="explorer-header-right">
          <span
            className={`source-pill ${source === "unavailable" ? "sample" : "live"}`}
            title={
              source === "unavailable"
                ? "The disclosure database couldn't be reached"
                : "Served live from the disclosure database"
            }
          >
            <span className="source-dot" aria-hidden="true" />
            {source === "unavailable" ? "Data unavailable" : "Live data"}
          </span>
          <FreshnessBadge meta={overview?.meta} />
          <button className="explorer-close" onClick={onClose} aria-label="Close data explorer">
            <CloseIcon />
          </button>
        </div>
      </header>

      <nav className="explorer-tabs" role="tablist" aria-label="Data Explorer sections" onKeyDown={onTabKeyDown}>
        {TABS.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              id={`explorer-tab-${t.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls="explorer-tabpanel"
              tabIndex={selected ? 0 : -1}
              className={`explorer-tab ${selected ? "active" : ""}`}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div
        className="explorer-body"
        id="explorer-tabpanel"
        role="tabpanel"
        aria-labelledby={`explorer-tab-${active}`}
        tabIndex={0}
      >
        {source === "unavailable" && <UnavailableBanner />}
        <TabBody onSource={handleSource} />
      </div>
    </div>
  );
}

DataExplorer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
