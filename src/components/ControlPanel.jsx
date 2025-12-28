import React, { useCallback } from "react";
import OccupationSelector from "./OccupationSelector";
import SalaryInput from "./SalaryInput";
import StatisticsPanel from "./StatisticsPanel";
import Legend from "./Legend";

/**
 * Control panel component containing all user controls
 */
export default function ControlPanel({
  collapsed,
  onToggleCollapse,
  socText,
  onSocSelect,
  salary,
  onSalaryChange,
  stats,
  onShare,
  salaryDisabled = false,
}) {
  const handleToggleCollapse = useCallback(() => {
    onToggleCollapse((v) => !v);
  }, [onToggleCollapse]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggleCollapse();
      }
    },
    [handleToggleCollapse]
  );

  return (
    <div className={`control-panel ${collapsed ? "collapsed" : ""}`}>
      {/* Title Row (clickable) */}
      <div
        className="title-row"
        onClick={handleToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={collapsed ? "Expand panel" : "Minimize panel"}
        aria-expanded={!collapsed}
      >
        <div className="title">H1B Wage Tracker</div>
        <div className="collapse-icon" title={collapsed ? "Expand" : "Minimize"} aria-hidden="true">
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 9l6 6 6-6H6z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 15l6-6 6 6H6z" />
            </svg>
          )}
        </div>
      </div>

      {/* Everything else hides when collapsed */}
      {!collapsed && (
        <>
          <div className="subtitle">
            See which wage level your job and salary fall under in each U.S. county (tap on it).
            For better viewing, check it on laptop / desktop.
          </div>

          <OccupationSelector value={socText} onSelect={onSocSelect} />

          <div className="section">
            <label className="label" htmlFor="salary-input">
              Annual Base Salary
            </label>
            <SalaryInput value={salary} onChange={onSalaryChange} disabled={salaryDisabled} />
          </div>

          <StatisticsPanel stats={stats} />

          <Legend />

          {/* Footer */}
          <div className="footer">
            <div className="footer-left">
              <a
                href="https://github.com/ankitjawla/H1B-Wage-Tracker"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source code on GitHub"
                title="GitHub"
                className="icon-link"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.55-3.87-1.55-.53-1.36-1.29-1.72-1.29-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.45.11-3.02 0 0 .97-.31 3.18 1.18a11.07 11.07 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.57.23 2.73.11 3.02.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56 4.56-1.53 7.85-5.86 7.85-10.96C23.5 5.74 18.27.5 12 .5z" />
                </svg>
              </a>

              <button
                type="button"
                onClick={onShare}
                aria-label="Share this page"
                title="Share"
                className="icon-button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.5 2.5 0 000-1.39l7.02-4.11A2.99 2.99 0 0018 7.91a3 3 0 10-3-3c0 .23.03.45.08.66L8.05 9.7a3 3 0 100 4.61l7.02 4.11c-.05.2-.07.41-.07.63a3 3 0 103-3z" />
                </svg>
              </button>
            </div>

            <a
              className="oflc-link"
              href="https://flag.dol.gov/wage-data/wage-search"
              target="_blank"
              rel="noopener noreferrer"
            >
              OFLC Wage Data ↗
            </a>
          </div>

          <div className="credit">
            Created by{" "}
            <a
              href="https://github.com/ankitjawla"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View ankit.jawla's GitHub profile"
            >
              <strong>@ankit.jawla</strong>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

