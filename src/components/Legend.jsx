import React from "react";

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
      <LegendItem color="#FEF3C7" label="Level I (Entry)" />
      <LegendItem color="#F59E0B" label="Level II (Qualified)" />
      <LegendItem color="#8B5CF6" label="Level III (Experienced)" />
      <LegendItem color="#4C1D95" label="Level IV (Fully Competent)" />
    </div>
  );
}

