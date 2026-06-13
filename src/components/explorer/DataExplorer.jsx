import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import CloseIcon from "../icons/CloseIcon";
import { SampleBanner } from "./primitives";
import OverviewTab from "./OverviewTab";
import EmployerTab from "./EmployerTab";
import PermTab from "./PermTab";
import WagesTab from "./WagesTab";
import UscisTab from "./UscisTab";
import "./DataExplorer.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "employers", label: "Employers" },
  { id: "perm", label: "PERM" },
  { id: "wages", label: "Salary Insights" },
  { id: "uscis", label: "USCIS Approvals" },
];

/**
 * Full-screen Data Explorer overlay for LCA / PERM / USCIS disclosure data.
 * @param {boolean} isOpen
 * @param {Function} onClose
 */
export default function DataExplorer({ isOpen, onClose }) {
  const [active, setActive] = useState("overview");
  const [source, setSource] = useState("live");

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Each tab reports whether it rendered live or sample data
  const handleSource = useCallback((s) => setSource(s), []);

  if (!isOpen) return null;

  const TabBody = {
    overview: OverviewTab,
    employers: EmployerTab,
    perm: PermTab,
    wages: WagesTab,
    uscis: UscisTab,
  }[active];

  return (
    <div className="explorer-overlay" role="dialog" aria-modal="true" aria-label="H1B data explorer">
      <header className="explorer-header">
        <div className="explorer-title">
          <span className="explorer-logo">📊</span>
          <div>
            <h2>H1B / PERM Data Explorer</h2>
            <p>LCA, PERM &amp; USCIS disclosure data for applicants, employees &amp; employers</p>
          </div>
        </div>
        <button className="explorer-close" onClick={onClose} aria-label="Close data explorer">
          <CloseIcon />
        </button>
      </header>

      <nav className="explorer-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`explorer-tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="explorer-body">
        {source === "sample" && <SampleBanner />}
        <TabBody onSource={handleSource} />
      </div>
    </div>
  );
}

DataExplorer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
