import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchData } from "../api";

describe("fetchData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns live data when the API responds with configured data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ configured: true, source: "live", totals: { lca: 5 } }),
      })
    );

    const { data, source } = await fetchData("overview");
    expect(source).toBe("live");
    expect(data.totals.lca).toBe(5);
  });

  it("falls back to sample data when the API is unconfigured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ configured: false, source: "unconfigured" }),
      })
    );

    const { data, source } = await fetchData("overview");
    expect(source).toBe("sample");
    expect(data.totals).toBeDefined();
    expect(typeof data.totals.lca).toBe("number");
  });

  it("falls back to sample data on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const { data, source } = await fetchData("perm");
    expect(source).toBe("sample");
    expect(data.summary).toBeDefined();
  });

  it("filters sample employers by query", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { data, source } = await fetchData("employers", { q: "hooli" });
    expect(source).toBe("sample");
    expect(data.employers.length).toBeGreaterThan(0);
    expect(data.employers.every((e) => e.name.toLowerCase().includes("hooli"))).toBe(true);
  });

  it("requires at least 2 characters for sample employer search", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { data } = await fetchData("employers", { q: "h" });
    expect(data.employers).toEqual([]);
  });

  it("builds query strings without empty params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ configured: true, source: "live" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchData("wages", { soc: "15-1252", state: "", salary: 130000 });
    expect(fetchMock).toHaveBeenCalledWith("/api/wages?soc=15-1252&salary=130000");
  });
});
