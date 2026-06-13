import { describe, it, expect } from "vitest";
import { toCsv } from "../csv";

describe("toCsv", () => {
  const columns = [
    { key: "state", label: "State" },
    { key: "count", label: "Filings" },
  ];

  it("builds a header row from column labels", () => {
    expect(toCsv([], columns)).toBe("State,Filings");
  });

  it("serializes rows in column order", () => {
    const rows = [
      { state: "CA", count: 100 },
      { state: "TX", count: 50 },
    ];
    expect(toCsv(rows, columns)).toBe("State,Filings\nCA,100\nTX,50");
  });

  it("quotes fields containing commas, quotes, or newlines", () => {
    const rows = [{ state: "Doe, John", count: 'a "b"' }];
    expect(toCsv(rows, columns)).toBe('State,Filings\n"Doe, John","a ""b"""');
  });

  it("renders null/undefined as empty fields", () => {
    const rows = [{ state: null, count: undefined }];
    expect(toCsv(rows, columns)).toBe("State,Filings\n,");
  });

  it("falls back to key when a column has no label", () => {
    expect(toCsv([], [{ key: "soc" }])).toBe("soc");
  });

  it("returns empty string for invalid input", () => {
    expect(toCsv(null, columns)).toBe("");
    expect(toCsv([], [])).toBe("");
  });
});
