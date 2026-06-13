import { describe, it, expect, beforeEach } from "vitest";
import { readExplorerUrl, writeExplorerUrl, readFilter, writeFilter } from "../explorerUrl";

function setUrl(search) {
  window.history.replaceState({}, "", `/${search}`);
}

describe("explorerUrl", () => {
  beforeEach(() => setUrl(""));

  describe("readExplorerUrl", () => {
    it("reports closed by default", () => {
      expect(readExplorerUrl()).toEqual({ open: false, tab: "overview" });
    });

    it("reads open state and a valid tab", () => {
      setUrl("?view=explorer&tab=perm");
      expect(readExplorerUrl()).toEqual({ open: true, tab: "perm" });
    });

    it("falls back to overview for an unknown tab", () => {
      setUrl("?view=explorer&tab=bogus");
      expect(readExplorerUrl()).toEqual({ open: true, tab: "overview" });
    });
  });

  describe("writeExplorerUrl", () => {
    it("writes view and tab params", () => {
      writeExplorerUrl({ open: true, tab: "wages" });
      expect(window.location.search).toContain("view=explorer");
      expect(window.location.search).toContain("tab=wages");
    });

    it("removes params when closed", () => {
      setUrl("?view=explorer&tab=wages");
      writeExplorerUrl({ open: false });
      expect(window.location.search).not.toContain("view");
      expect(window.location.search).not.toContain("tab");
    });

    it("preserves unrelated params (e.g. the map's soc/salary)", () => {
      setUrl("?soc=15-1252&salary=130000");
      writeExplorerUrl({ open: true, tab: "uscis" });
      const params = new URLSearchParams(window.location.search);
      expect(params.get("soc")).toBe("15-1252");
      expect(params.get("salary")).toBe("130000");
      expect(params.get("view")).toBe("explorer");
      expect(params.get("tab")).toBe("uscis");
    });

    it("ignores an invalid tab but keeps open state", () => {
      writeExplorerUrl({ open: true, tab: "nope" });
      const params = new URLSearchParams(window.location.search);
      expect(params.get("view")).toBe("explorer");
      expect(params.get("tab")).toBeNull();
    });

    it("clears filter params when closed", () => {
      setUrl("?view=explorer&tab=wages&f_state=CA&f_soc=15-1252");
      writeExplorerUrl({ open: false });
      expect(window.location.search).not.toContain("f_state");
      expect(window.location.search).not.toContain("f_soc");
    });
  });

  describe("filters", () => {
    it("reads and writes namespaced filter params", () => {
      writeFilter("state", "CA");
      expect(window.location.search).toContain("f_state=CA");
      expect(readFilter("state")).toBe("CA");
    });

    it("does not collide with the map's soc/salary params", () => {
      setUrl("?soc=15-1252&salary=130000");
      writeFilter("soc", "11-1011");
      writeFilter("salary", "90000");
      const params = new URLSearchParams(window.location.search);
      expect(params.get("soc")).toBe("15-1252"); // map's param untouched
      expect(params.get("salary")).toBe("130000");
      expect(params.get("f_soc")).toBe("11-1011"); // explorer's namespaced param
      expect(params.get("f_salary")).toBe("90000");
    });

    it("removes a filter when set to empty", () => {
      writeFilter("state", "CA");
      writeFilter("state", "");
      expect(window.location.search).not.toContain("f_state");
      expect(readFilter("state")).toBe("");
    });

    it("ignores unknown filter names", () => {
      writeFilter("bogus", "x");
      expect(window.location.search).not.toContain("bogus");
      expect(readFilter("bogus")).toBe("");
    });
  });
});
