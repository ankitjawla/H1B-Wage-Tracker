import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Section, ExplorerLoading } from "./primitives";
import { fetchData } from "../../utils/api";
import { formatNumber, formatUSD } from "../../utils/format";

const sumBy = (arr, k) => (arr ?? []).reduce((a, x) => a + (x[k] || 0), 0);

function deriveMetrics(profile) {
  const { employer, lcaByYear, permByYear, uscis, wageStats, topOccupations } = profile;
  const uscisApprovals = (uscis ?? []).reduce(
    (a, u) => a + (u.initialApproval || 0) + (u.continuingApproval || 0),
    0
  );
  const top = (topOccupations ?? [])[0];
  return {
    name: employer?.name ?? "—",
    location: [employer?.city, employer?.state].filter(Boolean).join(", ") || "—",
    lca: sumBy(lcaByYear, "count"),
    perm: sumBy(permByYear, "count"),
    uscisApprovals,
    medianWage: wageStats?.p50 ?? null,
    topOccupation: top ? `${top.socCode} — ${top.socTitle}` : "—",
  };
}

const ROWS = [
  { key: "location", label: "Location", fmt: (v) => v },
  { key: "lca", label: "LCA filings (H-1B)", fmt: formatNumber, best: "max" },
  { key: "perm", label: "PERM filings", fmt: formatNumber, best: "max" },
  { key: "uscisApprovals", label: "USCIS approvals", fmt: formatNumber, best: "max" },
  { key: "medianWage", label: "Median LCA wage", fmt: formatUSD, best: "max" },
  { key: "topOccupation", label: "Top occupation", fmt: (v) => v },
];

/**
 * Side-by-side comparison of 2–3 employers.
 * @param {Array<{id:number,name:string}>} items
 * @param {Function} onSource
 * @param {Function} onBack
 */
export default function EmployerCompare({ items, onSource, onBack }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const onSourceRef = useRef(onSource);
  onSourceRef.current = onSource;
  const key = items.map((i) => i.id).join(",");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(items.map((i) => fetchData("employer", { id: i.id }))).then((results) => {
      if (cancelled) return;
      setMetrics(results.map((r) => deriveMetrics(r.data)));
      setLoading(false);
      // If any response was sample, report sample so the banner/pill show
      onSourceRef.current?.(results.some((r) => r.source === "sample") ? "sample" : "live");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Highlight the best (max) numeric cell per row
  const bestIndex = (row) => {
    if (row.best !== "max" || !metrics) return -1;
    let bi = -1;
    let bv = -Infinity;
    metrics.forEach((m, i) => {
      const v = m[row.key];
      if (typeof v === "number" && v > bv) {
        bv = v;
        bi = i;
      }
    });
    return bv > 0 ? bi : -1;
  };

  return (
    <div>
      <button className="explorer-back" onClick={onBack}>← Back to search</button>
      <Section title="Compare employers" subtitle="Side-by-side H-1B, PERM and USCIS metrics.">
        {loading || !metrics ? (
          <ExplorerLoading label="Loading comparison…" />
        ) : (
          <div className="compare-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  {metrics.map((m, i) => (
                    <th scope="col" key={items[i].id}>{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const bi = bestIndex(row);
                  return (
                    <tr key={row.key}>
                      <th scope="row">{row.label}</th>
                      {metrics.map((m, i) => (
                        <td key={items[i].id} className={i === bi ? "compare-best" : undefined}>
                          {m[row.key] === null ? "—" : row.fmt(m[row.key])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

EmployerCompare.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string })
  ).isRequired,
  onSource: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
