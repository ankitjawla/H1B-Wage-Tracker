import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchData } from "../api";

function mockJson(json) {
  return vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(json) });
}

describe("fetchData (/api serverless)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns live data on success", async () => {
    vi.stubGlobal("fetch", mockJson({ configured: true, totals: { lca: 5 } }));
    const { data, source } = await fetchData("overview");
    expect(source).toBe("live");
    expect(data.totals.lca).toBe(5);
  });

  it("builds the endpoint URL and forwards non-empty params", async () => {
    const fetchMock = mockJson({ configured: true, distribution: {} });
    vi.stubGlobal("fetch", fetchMock);
    await fetchData("wages", { soc: "15-1252", state: "CA", salary: 130000 });
    expect(fetchMock).toHaveBeenCalledWith("/api/wages?soc=15-1252&state=CA&salary=130000");
  });

  it("flags 'unavailable' + empty shape when the DB isn't configured", async () => {
    vi.stubGlobal("fetch", mockJson({ configured: false }));
    const { data, source } = await fetchData("perm");
    expect(source).toBe("unavailable");
    expect(data).toEqual({ summary: {}, byYear: [], byStatus: [], topEmployers: [], topOccupations: [] });
  });

  it("treats a network error as unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const { source } = await fetchData("overview");
    expect(source).toBe("unavailable");
  });

  it("treats a non-2xx response as unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { source } = await fetchData("uscis");
    expect(source).toBe("unavailable");
  });

  it("short-circuits employer search under 2 characters without a request", async () => {
    const fetchMock = mockJson({ employers: [] });
    vi.stubGlobal("fetch", fetchMock);
    const { data, source } = await fetchData("employers", { q: "a" });
    expect(source).toBe("live");
    expect(data.employers).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
