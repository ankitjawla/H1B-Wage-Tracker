import { describe, it, expect, beforeEach } from "vitest";
import { readExplorerUrl, writeExplorerUrl } from "../explorerUrl";

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
  });
});
