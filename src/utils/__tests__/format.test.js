import { describe, it, expect } from "vitest";
import { formatNumber, formatCompact, formatUSD, formatPct, ordinal } from "../format";

describe("format utilities", () => {
  describe("formatNumber", () => {
    it("adds thousands separators", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(0)).toBe("0");
    });
    it("returns em dash for non-numbers", () => {
      expect(formatNumber(null)).toBe("—");
      expect(formatNumber(undefined)).toBe("—");
      expect(formatNumber(NaN)).toBe("—");
    });
  });

  describe("formatCompact", () => {
    it("abbreviates thousands and millions", () => {
      expect(formatCompact(12500)).toBe("12.5K");
      expect(formatCompact(1_200_000)).toBe("1.2M");
      expect(formatCompact(950)).toBe("950");
    });
    it("returns em dash for non-numbers", () => {
      expect(formatCompact("x")).toBe("—");
    });
  });

  describe("formatUSD", () => {
    it("formats whole dollars", () => {
      expect(formatUSD(142000)).toBe("$142,000");
      expect(formatUSD(142000.7)).toBe("$142,001");
    });
    it("returns em dash for non-numbers", () => {
      expect(formatUSD(null)).toBe("—");
    });
  });

  describe("formatPct", () => {
    it("formats with one decimal", () => {
      expect(formatPct(97)).toBe("97.0%");
      expect(formatPct(33.33)).toBe("33.3%");
    });
    it("returns em dash for non-numbers", () => {
      expect(formatPct(null)).toBe("—");
    });
  });

  describe("ordinal", () => {
    it("applies correct suffixes", () => {
      expect(ordinal(1)).toBe("1st");
      expect(ordinal(2)).toBe("2nd");
      expect(ordinal(3)).toBe("3rd");
      expect(ordinal(4)).toBe("4th");
      expect(ordinal(11)).toBe("11th");
      expect(ordinal(73)).toBe("73rd");
    });
  });
});
