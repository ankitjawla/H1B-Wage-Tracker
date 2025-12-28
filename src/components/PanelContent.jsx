import React from "react";
import PropTypes from "prop-types";
import OccupationSelector from "./OccupationSelector";
import SalaryInput from "./SalaryInput";
import StatisticsPanel from "./StatisticsPanel";
import Legend from "./Legend";

/**
 * Panel content component containing main controls
 * @param {string} socText - Current SOC text value
 * @param {Function} onSocSelect - SOC selection callback
 * @param {number} salary - Current salary value
 * @param {Function} onSalaryChange - Salary change callback
 * @param {boolean} salaryDisabled - Whether salary input is disabled
 * @param {Object} stats - Statistics object
 * @param {string} id - Content ID for aria-controls
 */
export default function PanelContent({
  socText,
  onSocSelect,
  salary,
  onSalaryChange,
  salaryDisabled,
  stats,
  id,
}) {
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      <div className="subtitle">
        See which wage level your job and salary fall under in each U.S. county (tap on it). For
        better viewing, check it on laptop / desktop.
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
    </div>
  );
}

PanelContent.propTypes = {
  socText: PropTypes.string.isRequired,
  onSocSelect: PropTypes.func.isRequired,
  salary: PropTypes.number.isRequired,
  onSalaryChange: PropTypes.func.isRequired,
  salaryDisabled: PropTypes.bool,
  stats: PropTypes.shape({
    level1: PropTypes.number,
    level2: PropTypes.number,
    level3: PropTypes.number,
    level4: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  id: PropTypes.string.isRequired,
};
