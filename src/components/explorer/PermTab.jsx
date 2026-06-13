import React from "react";
import PropTypes from "prop-types";
import { StatCard, BarList, Section, ExportButton } from "./primitives";
import LineChart from "./LineChart";
import { useExplorerData } from "./useExplorerData";
import { useUrlFilter } from "./useUrlFilter";
import { formatNumber, formatUSD, formatPct } from "../../utils/format";

export default function PermTab({ onSource }) {
  const [state, setState] = useUrlFilter("state");
  const [soc, setSoc] = useUrlFilter("soc");
  const { data, loading } = useExplorerData("perm", { state, soc }, onSource);

  const s = data?.summary ?? {};
  const certRate = s.total ? (s.certified / s.total) * 100 : null;

  return (
    <div>
      <Section
        title="PERM labor certification (green card stage)"
        subtitle="Permanent labor certification filings (Form ETA-9089) by employer, occupation and location."
      >
        <div className="explorer-filters">
          <input
            className="explorer-input"
            placeholder="Filter by state (e.g. CA)"
            value={state}
            maxLength={2}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            aria-label="Filter PERM by state"
          />
          <input
            className="explorer-input"
            placeholder="Filter by SOC code (e.g. 15-1252)"
            value={soc}
            onChange={(e) => setSoc(e.target.value)}
            aria-label="Filter PERM by SOC code"
          />
        </div>

        {loading || !data ? (
          <div className="explorer-loading">Loading PERM data…</div>
        ) : (
          <>
            <div className="stat-grid">
              <StatCard label="Total filings" value={formatNumber(s.total)} accent="#1E3A8A" />
              <StatCard label="Certified" value={formatNumber(s.certified)} accent="#16a34a"
                hint={certRate != null ? `${formatPct(certRate)} cert. rate` : undefined} />
              <StatCard label="Median wage offer" value={formatUSD(s.medianWage)} accent="#2563EB" />
            </div>

            <div className="explorer-two-col">
              <div>
                <h4 className="explorer-subhead">Filings by fiscal year</h4>
                <LineChart
                  color="#1E3A8A"
                  data={(data.byYear ?? []).map((y) => ({ label: `FY${y.fy}`, value: y.count }))}
                />
              </div>
              <div>
                <h4 className="explorer-subhead">By case status</h4>
                <BarList
                  color="#1E3A8A"
                  items={(data.byStatus ?? []).map((x) => ({ key: x.status, label: x.status, value: x.count }))}
                />
              </div>
            </div>

            <h4 className="explorer-subhead">Top employers</h4>
            <BarList
              color="#2563EB"
              items={(data.topEmployers ?? []).map((e) => ({ key: e.id, label: e.name, value: e.count }))}
            />

            <div className="explorer-subhead-row">
              <h4 className="explorer-subhead">Top occupations</h4>
              <ExportButton
                rows={data.topOccupations ?? []}
                columns={[
                  { key: "socCode", label: "SOC code" },
                  { key: "socTitle", label: "Occupation" },
                  { key: "count", label: "Filings" },
                  { key: "medianWage", label: "Median wage offer" },
                ]}
                filename="perm-top-occupations"
              />
            </div>
            <BarList
              color="#60A5FA"
              items={(data.topOccupations ?? []).map((o) => ({
                key: o.socCode,
                label: `${o.socCode} — ${o.socTitle}`,
                value: o.count,
              }))}
            />
          </>
        )}
      </Section>
    </div>
  );
}

PermTab.propTypes = { onSource: PropTypes.func.isRequired };
