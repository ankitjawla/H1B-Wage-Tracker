import React from "react";
import PropTypes from "prop-types";
import { formatNumber } from "../../utils/format";

/** A compact labeled metric card. */
export function StatCard({ label, value, hint, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTopColor: accent } : undefined}>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {hint && <div className="stat-card-hint">{hint}</div>}
    </div>
  );
}
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  hint: PropTypes.string,
  accent: PropTypes.string,
};

/** Horizontal bar list, scaled to the max value in the set. */
export function BarList({ items, color = "#2563EB", formatValue = formatNumber }) {
  const max = Math.max(1, ...items.map((i) => i.value || 0));
  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-row" key={item.key ?? item.label}>
          <div className="bar-label" title={item.label}>
            {item.label}
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${((item.value || 0) / max) * 100}%`, background: color }}
            />
          </div>
          <div className="bar-value">{formatValue(item.value)}</div>
        </div>
      ))}
      {items.length === 0 && <div className="explorer-empty">No data.</div>}
    </div>
  );
}
BarList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      value: PropTypes.number,
    })
  ).isRequired,
  color: PropTypes.string,
  formatValue: PropTypes.func,
};

/** Section heading with optional subtitle. */
export function Section({ title, subtitle, children }) {
  return (
    <section className="explorer-section">
      <h3 className="explorer-section-title">{title}</h3>
      {subtitle && <p className="explorer-section-subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}
Section.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

/** Banner shown when the explorer is rendering illustrative sample data. */
export function SampleBanner() {
  return (
    <div className="sample-banner" role="status">
      <strong>Sample data.</strong> The live disclosure database isn&apos;t connected yet, so
      these figures are illustrative only. Connect the Neon integration and run the ingestion
      script to see real DOL&nbsp;&amp;&nbsp;USCIS data.
    </div>
  );
}
