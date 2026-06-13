import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchData } from "../api";

function mockRpc(json) {
  return vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(json) });
}

describe("fetchData (Supabase RPC)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns live data from the RPC on success", async () => {
    vi.stubGlobal("fetch", mockRpc({ totals: { lca: 5 }, topStates: [], meta: [] }));
    const { data, source } = await fetchData("overview");
    expect(source).toBe("live");
    expect(data.totals.lca).toBe(5);
  });

  it("calls the correct RPC function and forwards params", async () => {
    const fetchMock = mockRpc({ distribution: {} });
    vi.stubGlobal("fetch", fetchMock);

    await fetchData("wages", { soc: "15-1252", state: "ca", salary: "130000" });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/rest\/v1\/rpc\/h1b_wages$/);
    expect(JSON.parse(opts.body)).toEqual({ soc: "15-1252", state: "ca", salary: 130000 });
    expect(opts.headers.apikey).toBeTruthy();
  });

  it("flags source 'unavailable' and returns an empty shape on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const { data, source } = await fetchData("perm");
    expect(source).toBe("unavailable");
    expect(data).toEqual({ summary: {}, byYear: [], byStatus: [], topEmployers: [], topOccupations: [] });
  });

  it("treats a non-2xx response as unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { source } = await fetchData("overview");
    expect(source).toBe("unavailable");
  });

  it("short-circuits employer search under 2 characters without a request", async () => {
    const fetchMock = mockRpc({ employers: [] });
    vi.stubGlobal("fetch", fetchMock);
    const { data, source } = await fetchData("employers", { q: "a" });
    expect(source).toBe("live");
    expect(data.employers).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps employer id to emp_id", async () => {
    const fetchMock = mockRpc({ employer: { id: 3 } });
    vi.stubGlobal("fetch", fetchMock);
    await fetchData("employer", { id: 3 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ emp_id: 3 });
  });
});
