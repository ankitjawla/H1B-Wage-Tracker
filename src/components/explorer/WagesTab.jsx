import React from "react";
import PropTypes from "prop-types";
import { StatCard, BarList, Section, ExportButton, ExplorerLoading } from "./primitives";
import { useExplorerData } from "./useExplorerData";
import { useUrlFilter } from "./useUrlFilter";
import { useDebounce } from "../../hooks/useDebounce";
import { formatNumber, formatUSD, ordinal } from "../../utils/format";
import { parseCurrency } from "../../utils/currency";

export default function WagesTab({ onSource }) {
  const [soc, setSoc] = useUrlFilter("soc");
  const [state, setState] = useUrlFilter("state");
  const [salary, setSalary] = useUrlFilter("salary");
  const debouncedSalary = useDebounce(salary, 400);

  const { data, loading } = useExplorerData(
    "wages",
    { soc, state, salary: debouncedSalary ? parseCurrency(debouncedSalary) : "" },
    onSource
  );

  const d = data?.distribution ?? {};
  const pct = data?.salaryPercentile;

  return (
    <div>
      <Section
        title="Filed-wage insights"
        subtitle="Real offered wages from H-1B LCA filings — not just the DOL prevailing-wage thresholds. See where a salary lands in the distribution."
      >
        <div className="explorer-filters">
          <input className="explorer-input" placeholder="SOC code (e.g. 15-1252)"
            value={soc} onChange={(e) => setSoc(e.target.value)} aria-label="Filter wages by SOC code" />
          <input className="explorer-input" placeholder="State (e.g. CA)" value={state}
            maxLength={2} onChange={(e) => setState(e.target.value.toUpperCase())} aria-label="Filter wages by state" />
          <input className="explorer-input" placeholder="Your salary (e.g. 130000)"
            inputMode="numeric" value={salary}
            onChange={(e) => setSalary(e.target.value.replace(/[^\d]/g, ""))}
            aria-label="Compare your salary" />
        </div>

        {loading || !data ? (
          <ExplorerLoading label="Loading wage data…" />
        ) : (
          <>
            {pct && (
              <div className="percentile-callout">
                A salary of <strong>{formatUSD(pct.salary)}</strong> ranks around the{" "}
                <strong>{ordinal(pct.percentile)} percentile</strong> of filed wages
                {soc ? ` for SOC ${soc}` : ""}
                {state ? ` in ${state}` : ""}.
              </div>
            )}

            <div className="stat-grid">
              <StatCard label="Filings" value={formatNumber(d.count)} accent="#60A5FA" />
              <StatCard label="Median (P50)" value={formatUSD(d.p50)} accent="#2563EB" />
              <StatCard label="P25" value={formatUSD(d.p25)} accent="#93C5FD" />
              <StatCard label="P75" value={formatUSD(d.p75)} accent="#1E3A8A" />
              <StatCard label="P90" value={formatUSD(d.p90)} accent="#1E40AF" />
            </div>

            <h4 className="explorer-subhead">Wage percentile ladder</h4>
            <BarList
              formatValue={formatUSD}
              items={[
                { key: "p10", label: "10th pct", value: d.p10 },
                { key: "p25", label: "25th pct", value: d.p25 },
                { key: "p50", label: "Median", value: d.p50 },
                { key: "p75", label: "75th pct", value: d.p75 },
                { key: "p90", label: "90th pct", value: d.p90 },
              ]}
            />

            <div className="explorer-two-col">
              <div>
                <h4 className="explorer-subhead">By prevailing-wage level</h4>
                <BarList
                  color="#1E3A8A"
                  items={(data.byLevel ?? []).map((l) => ({
                    key: l.level, label: `Level ${l.level}`, value: l.count,
                  }))}
                />
              </div>
              <div>
                <div className="explorer-subhead-row">
                  <h4 className="explorer-subhead">Median wage by state</h4>
                  <ExportButton
                    rows={data.byState ?? []}
                    columns={[
                      { key: "state", label: "State" },
                      { key: "medianWage", label: "Median filed wage" },
                      { key: "count", label: "Filings" },
                    ]}
                    filename="lca-median-wage-by-state"
                  />
                </div>
                <BarList
                  formatValue={formatUSD}
                  items={(data.byState ?? []).map((x) => ({
                    key: x.state, label: x.state, value: x.medianWage,
                  }))}
                />
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

WagesTab.propTypes = { onSource: PropTypes.func.isRequired };
