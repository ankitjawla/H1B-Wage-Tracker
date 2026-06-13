import React, { useState } from "react";
import PropTypes from "prop-types";
import { StatCard, BarList, Section, ExplorerLoading } from "./primitives";
import LineChart from "./LineChart";
import { useExplorerData } from "./useExplorerData";
import { useDebounce } from "../../hooks/useDebounce";
import { formatNumber, formatUSD } from "../../utils/format";

function EmployerProfile({ id, onSource, onBack }) {
  const { data, loading } = useExplorerData("employer", { id }, onSource);
  if (loading || !data?.employer) return <ExplorerLoading label="Loading employer…" />;

  const { employer, lcaByYear = [], permByYear = [], topOccupations = [], wageStats, uscis = [] } = data;
  const uscisTotals = uscis.reduce(
    (a, u) => a + (u.initialApproval || 0) + (u.continuingApproval || 0),
    0
  );

  return (
    <div>
      <button className="explorer-back" onClick={onBack}>← Back to search</button>
      <Section title={employer.name} subtitle={[employer.city, employer.state].filter(Boolean).join(", ")}>
        <div className="stat-grid">
          <StatCard label="LCA filings" value={formatNumber(lcaByYear.reduce((a, y) => a + y.count, 0))} accent="#2563EB" />
          <StatCard label="PERM filings" value={formatNumber(permByYear.reduce((a, y) => a + y.count, 0))} accent="#1E3A8A" />
          <StatCard label="USCIS approvals" value={formatNumber(uscisTotals)} accent="#16a34a" />
          {wageStats?.p50 != null && (
            <StatCard label="Median LCA wage" value={formatUSD(wageStats.p50)} accent="#60A5FA"
              hint={wageStats.p25 && wageStats.p75 ? `${formatUSD(wageStats.p25)}–${formatUSD(wageStats.p75)}` : undefined} />
          )}
        </div>

        <div className="explorer-two-col">
          <div>
            <h4 className="explorer-subhead">LCA filings by year</h4>
            <LineChart data={lcaByYear.map((y) => ({ label: `FY${y.fy}`, value: y.count }))} />
          </div>
          <div>
            <h4 className="explorer-subhead">PERM filings by year</h4>
            <LineChart color="#1E3A8A" data={permByYear.map((y) => ({ label: `FY${y.fy}`, value: y.count }))} />
          </div>
        </div>

        <h4 className="explorer-subhead">Top sponsored occupations</h4>
        <BarList
          color="#60A5FA"
          items={topOccupations.map((o) => ({
            key: o.socCode,
            label: `${o.socCode} — ${o.socTitle}${o.medianWage ? ` (${formatUSD(o.medianWage)})` : ""}`,
            value: o.count,
          }))}
        />
      </Section>
    </div>
  );
}

EmployerProfile.propTypes = {
  id: PropTypes.number.isRequired,
  onSource: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default function EmployerTab({ onSource }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const debounced = useDebounce(query, 350);
  const enabled = debounced.trim().length >= 2;
  const { data, loading } = useExplorerData("employers", { q: debounced }, onSource, enabled);

  if (selected) {
    return <EmployerProfile id={selected} onSource={onSource} onBack={() => setSelected(null)} />;
  }

  const employers = data?.employers ?? [];
  return (
    <Section
      title="Employer explorer"
      subtitle="Search any sponsor to see their H-1B (LCA), PERM and USCIS petition history."
    >
      <div className="explorer-filters">
        <input
          className="explorer-input wide"
          placeholder="Search employer name (min 2 characters)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search employers"
        />
      </div>

      {!enabled && <div className="explorer-empty">Type at least 2 characters to search.</div>}
      {enabled && loading && <div className="explorer-loading">Searching…</div>}
      {enabled && !loading && employers.length === 0 && (
        <div className="explorer-empty">No employers found for “{debounced}”.</div>
      )}

      <div className="employer-list">
        {employers.map((e) => (
          <button key={e.id} className="employer-row" onClick={() => setSelected(e.id)}>
            <span className="employer-name">{e.name}</span>
            <span className="employer-meta">
              {e.state && <span className="employer-state">{e.state}</span>}
              <span>{formatNumber(e.lcaCount)} LCA</span>
              <span>{formatNumber(e.permCount)} PERM</span>
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}

EmployerTab.propTypes = { onSource: PropTypes.func.isRequired };
