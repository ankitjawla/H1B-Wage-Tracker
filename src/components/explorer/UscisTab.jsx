import React, { useState } from "react";
import PropTypes from "prop-types";
import { StatCard, BarList, Section, ExportButton, ExplorerLoading } from "./primitives";
import LineChart from "./LineChart";
import { useExplorerData } from "./useExplorerData";
import { useDebounce } from "../../hooks/useDebounce";
import { formatNumber, formatPct } from "../../utils/format";

export default function UscisTab({ onSource }) {
  const [employer, setEmployer] = useState("");
  const debounced = useDebounce(employer, 400);
  const { data, loading } = useExplorerData("uscis", { employer: debounced }, onSource);

  const t = data?.totals ?? {};

  return (
    <div>
      <Section
        title="USCIS H-1B petition outcomes"
        subtitle="Approvals & denials from the USCIS H-1B Employer Data Hub (initial vs. continuing petitions), updated annually."
      >
        <div className="explorer-filters">
          <input className="explorer-input" placeholder="Filter by employer name"
            value={employer} onChange={(e) => setEmployer(e.target.value)}
            aria-label="Filter USCIS data by employer" />
        </div>

        {loading || !data ? (
          <ExplorerLoading label="Loading USCIS data…" />
        ) : (
          <>
            <div className="stat-grid">
              <StatCard label="Approvals" value={formatNumber(t.approvals)} accent="#16a34a" />
              <StatCard label="Denials" value={formatNumber(t.denials)} accent="#dc2626" />
              <StatCard label="Approval rate" value={formatPct(t.approvalRate)} accent="#2563EB" />
              <StatCard label="Initial approvals" value={formatNumber(t.initialApproval)} accent="#60A5FA" />
              <StatCard label="Continuing approvals" value={formatNumber(t.continuingApproval)} accent="#1E3A8A" />
            </div>

            <h4 className="explorer-subhead">Approvals by fiscal year</h4>
            <LineChart
              color="#16a34a"
              data={(data.byYear ?? []).map((y) => ({
                label: `FY${y.fy}`,
                value: y.initialApproval + y.continuingApproval,
              }))}
            />

            <div className="explorer-subhead-row">
              <h4 className="explorer-subhead">Top employers by approvals</h4>
              <ExportButton
                rows={data.topEmployers ?? []}
                columns={[
                  { key: "name", label: "Employer" },
                  { key: "approvals", label: "Approvals" },
                  { key: "denials", label: "Denials" },
                ]}
                filename="uscis-top-employers"
              />
            </div>
            <BarList
              color="#2563EB"
              items={(data.topEmployers ?? []).map((e) => ({
                key: e.id, label: e.name, value: e.approvals,
              }))}
            />
          </>
        )}
      </Section>
    </div>
  );
}

UscisTab.propTypes = { onSource: PropTypes.func.isRequired };
