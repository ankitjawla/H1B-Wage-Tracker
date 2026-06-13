import React from "react";
import PropTypes from "prop-types";
import { computeLinePoints, pointsToPath } from "../../utils/chart";
import { formatNumber } from "../../utils/format";

const WIDTH = 280;

/**
 * Dependency-free SVG trend chart for a small year-over-year series.
 * @param {Array<{ label: string, value: number }>} data
 * @param {string} [color]
 * @param {number} [height]
 * @param {(v:number)=>string} [formatValue]
 * @param {string} [ariaLabel]
 */
export default function LineChart({
  data,
  color = "#2563EB",
  height = 80,
  formatValue = formatNumber,
  ariaLabel,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="explorer-empty">No trend data.</div>;
  }

  const values = data.map((d) => d.value ?? 0);
  const points = computeLinePoints(values, { width: WIDTH, height });
  const path = pointsToPath(points);
  const last = points[points.length - 1];
  const lastVal = values[values.length - 1];

  const summary =
    ariaLabel ||
    `Trend from ${data[0].label} (${formatValue(values[0])}) to ${
      data[data.length - 1].label
    } (${formatValue(lastVal)})`;

  return (
    <div className="line-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={summary}
        className="line-chart-svg"
      >
        {/* area under the line */}
        <path
          d={`${path} L${last.x} ${height} L${points[0].x} ${height} Z`}
          fill={color}
          opacity="0.08"
        />
        {/* the trend line */}
        <path d={path} fill="none" stroke={color} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
        {/* point markers */}
        {points.map((p, i) => (
          <circle key={data[i].label} cx={p.x} cy={p.y} r="2.5" fill={color} />
        ))}
      </svg>
      <div className="line-chart-axis">
        {data.map((d, i) => (
          <span key={d.label} className="line-chart-tick">
            {i === 0 || i === data.length - 1 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.number })
  ).isRequired,
  color: PropTypes.string,
  height: PropTypes.number,
  formatValue: PropTypes.func,
  ariaLabel: PropTypes.string,
};
