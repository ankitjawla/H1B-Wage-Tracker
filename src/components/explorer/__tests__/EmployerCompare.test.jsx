import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmployerTab from "../EmployerTab";

const EMPLOYERS = [
  { id: 1, name: "Globex", state: "CA", lcaCount: 100, permCount: 20 },
  { id: 2, name: "Initech", state: "TX", lcaCount: 60, permCount: 10 },
];

function profileFor(id) {
  return {
    employer: { id, name: id === 1 ? "Globex" : "Initech", city: "X", state: "CA" },
    lcaByYear: [{ fy: 2024, count: id === 1 ? 100 : 60 }],
    permByYear: [{ fy: 2024, count: id === 1 ? 20 : 10 }],
    uscis: [{ fy: 2024, initialApproval: 5, continuingApproval: 5, initialDenial: 0, continuingDenial: 0 }],
    wageStats: { p25: 90000, p50: id === 1 ? 150000 : 120000, p75: 180000 },
    topOccupations: [{ socCode: "15-1252", socTitle: "Software Developers", count: 50, medianWage: 150000 }],
  };
}

describe("EmployerTab comparison", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    // Mock the Supabase RPC endpoints used by the employer search + profiles.
    vi.stubGlobal(
      "fetch",
      vi.fn((url, opts) => {
        if (url.endsWith("/rpc/h1b_employers")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ employers: EMPLOYERS }) });
        }
        const id = JSON.parse(opts.body).emp_id;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(profileFor(id)) });
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("selects two employers and renders a side-by-side comparison", async () => {
    render(<EmployerTab onSource={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: /search employers/i }), {
      target: { value: "in" },
    });

    await waitFor(() => expect(screen.getByText("Globex")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("checkbox", { name: /add globex/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /add initech/i }));

    const compareBtn = screen.getByRole("button", { name: /compare \(2\)/i });
    expect(compareBtn).toBeEnabled();
    fireEvent.click(compareBtn);

    await waitFor(() =>
      expect(screen.getByRole("table")).toBeInTheDocument()
    );
    // Both employers appear as column headers
    expect(screen.getByRole("columnheader", { name: "Globex" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Initech" })).toBeInTheDocument();
    // Metric rows present
    expect(screen.getByRole("rowheader", { name: /LCA filings/i })).toBeInTheDocument();
  });
});
