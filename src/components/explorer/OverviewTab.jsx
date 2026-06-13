import React from "react";
import PropTypes from "prop-types";
import { StatCard, BarList, Section, ExportButton } from "./primitives";
import { useExplorerData } from "./useExplorerData";
import { formatCompact, formatNumber } from "../../utils/format";

export default function OverviewTab({ onSource }) {
  const { data, loading } = useExplorerData("overview", {}, onSource);

  if (loading || !data) return <div className="explorer-loading">Loading overview…</div>;

  const t = data.totals ?? {};
  return (
    <div>
      <Section
        title="At a glance"
        subtitle="Counts across the loaded LCA, PERM and USCIS disclosure datasets."
      >
        <div className="stat-grid">
          <StatCard label="LCA filings (H-1B)" value={formatCompact(t.lca)} accent="#2563EB"
            hint={t.latestLcaFy ? `through FY${t.latestLcaFy}` : undefined} />
          <StatCard label="PERM filings" value={formatCompact(t.perm)} accent="#1E3A8A"
            hint={t.latestPermFy ? `through FY${t.latestPermFy}` : undefined} />
          <StatCard label="Employers" value={formatCompact(t.employers)} accent="#60A5FA" />
          <StatCard label="USCIS approvals" value={formatCompact(t.uscisApprovals)} accent="#16a34a" />
          <StatCard label="USCIS denials" value={formatCompact(t.uscisDenials)} accent="#dc2626" />
        </div>
      </Section>

      <Section title="Top states by LCA volume">
        <div className="explorer-subhead-row">
          <span />
          <ExportButton
            rows={data.topStates ?? []}
            columns={[
              { key: "state", label: "State" },
              { key: "count", label: "LCA filings" },
            ]}
            filename="lca-top-states"
          />
        </div>
        <BarList
          items={(data.topStates ?? []).map((s) => ({ key: s.state, label: s.state, value: s.count }))}
          formatValue={formatNumber}
        />
      </Section>
    </div>
  );
}

OverviewTab.propTypes = { onSource: PropTypes.func.isRequired };
