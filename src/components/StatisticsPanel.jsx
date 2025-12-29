import React from "react";
import { WAGE_LEVEL_COLORS } from "../utils/constants";

/**
 * Statistics panel component displaying wage level coverage
 * @param {Object} stats - Statistics object with level counts
 */
export default function StatisticsPanel({ stats }) {
  return (
    <div className="stats-panel" role="region" aria-label="Coverage statistics">
      <div className="stats-title">Coverage Statistics</div>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value" style={{ color: WAGE_LEVEL_COLORS[1] }} aria-label={`Level I: ${stats.level1} counties`}>
            {stats.level1}
          </div>
          <div className="stat-label">Level I</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: WAGE_LEVEL_COLORS[2] }} aria-label={`Level II: ${stats.level2} counties`}>
            {stats.level2}
          </div>
          <div className="stat-label">Level II</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: WAGE_LEVEL_COLORS[3] }} aria-label={`Level III: ${stats.level3} counties`}>
            {stats.level3}
          </div>
          <div className="stat-label">Level III</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: WAGE_LEVEL_COLORS[4] }} aria-label={`Level IV: ${stats.level4} counties`}>
            {stats.level4}
          </div>
          <div className="stat-label">Level IV</div>
        </div>
      </div>
      <div className="stats-total">
        Total Counties: <strong>{stats.total}</strong>
      </div>
    </div>
  );
}



