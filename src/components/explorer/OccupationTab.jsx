import React from "react";
import PropTypes from "prop-types";
import { StatCard, BarList, Section, ExportButton } from "./primitives";
import LineChart from "./LineChart";
import { useExplorerData } from "./useExplorerData";
import { useUrlFilter } from "./useUrlFilter";
import { formatNumber, formatCompact, formatUSD } from "../../utils/format";

export default function OccupationTab({ onSource }) {
  const [soc, setSoc] = useUrlFilter("soc");
  const { data, loading } = useExplorerData("occupation", { soc }, onSource);

  const s = data?.summary ?? {};

  return (
    <Section
      title="Occupation insights"
      subtitle="A SOC-centric view: who sponsors a given occupation, what they pay, and how it trends over time. Combines H-1B (LCA) and PERM data."
    >
      <div className="explorer-filters">
        <input
          className="explorer-input wide"
          placeholder="SOC code (e.g. 15-1252 for Software Developers)"
          value={soc}
          onChange={(e) => setSoc(e.target.value)}
          aria-label="Filter by SOC code"
        />
      </div>

      {loading || !data ? (
        <div className="explorer-loading">Loading occupation data…</div>
      ) : (
        <>
          {data.socTitle && (
            <div className="percentile-callout">
              <strong>{data.soc}</strong> — {data.socTitle}
            </div>
          )}

          <div className="stat-grid">
            <StatCard label="LCA filings (H-1B)" value={formatCompact(s.lca)} accent="#2563EB" />
            <StatCard label="PERM filings" value={formatCompact(s.perm)} accent="#1E3A8A" />
            <StatCard label="Median filed wage" value={formatUSD(s.medianWage)} accent="#60A5FA" />
          </div>

          <div className="explorer-two-col">
            <div>
              <h4 className="explorer-subhead">H-1B filings by year</h4>
              <LineChart
                data={(data.byYear ?? []).map((y) => ({ label: `FY${y.fy}`, value: y.count }))}
              />
            </div>
            <div>
              <h4 className="explorer-subhead">Median wage trend</h4>
              <LineChart
                color="#16a34a"
                formatValue={formatUSD}
                data={(data.wageTrend ?? []).map((y) => ({ label: `FY${y.fy}`, value: y.medianWage }))}
              />
            </div>
          </div>

          <h4 className="explorer-subhead">Top sponsoring employers</h4>
          <BarList
            color="#2563EB"
            items={(data.topEmployers ?? []).map((e) => ({ key: e.id, label: e.name, value: e.count }))}
          />

          <div className="explorer-subhead-row">
            <h4 className="explorer-subhead">Top states (by filing volume)</h4>
            <ExportButton
              rows={data.topStates ?? []}
              columns={[
                { key: "state", label: "State" },
                { key: "count", label: "Filings" },
                { key: "medianWage", label: "Median wage" },
              ]}
              filename={`occupation-${soc || "all"}-by-state`}
            />
          </div>
          <BarList
            color="#60A5FA"
            items={(data.topStates ?? []).map((x) => ({ key: x.state, label: x.state, value: x.count }))}
          />
        </>
      )}
    </Section>
  );
}

OccupationTab.propTypes = { onSource: PropTypes.func.isRequired };
