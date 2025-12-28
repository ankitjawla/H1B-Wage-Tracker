import React from "react";
import { WAGE_LEVEL_COLORS, WAGE_LEVEL_NAMES } from "../utils/constants";

/**
 * Legend item component
 */
function LegendItem({ color, label }) {
  return (
    <div className="legend-item">
      <span className="legend-swatch" style={{ background: color }} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/**
 * Map legend component displaying wage level colors
 */
export default function Legend() {
  return (
    <div className="legend" title="Prevailing wage level color scale" role="region" aria-label="Wage level legend">
      <LegendItem color={WAGE_LEVEL_COLORS[1]} label={`Level I (${WAGE_LEVEL_NAMES[1]})`} />
      <LegendItem color={WAGE_LEVEL_COLORS[2]} label={`Level II (${WAGE_LEVEL_NAMES[2]})`} />
      <LegendItem color={WAGE_LEVEL_COLORS[3]} label={`Level III (${WAGE_LEVEL_NAMES[3]})`} />
      <LegendItem color={WAGE_LEVEL_COLORS[4]} label={`Level IV (${WAGE_LEVEL_NAMES[4]})`} />
    </div>
  );
}
