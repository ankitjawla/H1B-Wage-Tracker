import { describe, it, expect } from "vitest";
import { formatCurrency, parseCurrency, validateSalary } from "../currency";

describe("currency utilities", () => {
  describe("formatCurrency", () => {
    it("should format numbers with thousand separators", () => {
      expect(formatCurrency(1000)).toBe("1,000");
      expect(formatCurrency(150000)).toBe("150,000");
      expect(formatCurrency(1234567)).toBe("1,234,567");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("0");
    });

    it("should handle null/undefined", () => {
      expect(formatCurrency(null)).toBe("");
      expect(formatCurrency(undefined)).toBe("");
    });
  });

  describe("parseCurrency", () => {
    it("should parse currency strings to numbers", () => {
      expect(parseCurrency("1,000")).toBe(1000);
      expect(parseCurrency("150,000")).toBe(150000);
      expect(parseCurrency("1,234,567")).toBe(1234567);
    });

    it("should handle numbers", () => {
      expect(parseCurrency(1000)).toBe(1000);
    });

    it("should handle strings without commas", () => {
      expect(parseCurrency("1000")).toBe(1000);
    });
  });

  describe("validateSalary", () => {
    it("should validate salary within range", () => {
      expect(validateSalary(50000)).toBe(true);
      expect(validateSalary(150000)).toBe(true);
      expect(validateSalary(0)).toBe(true);
    });

    it("should reject salaries below minimum", () => {
      expect(validateSalary(-1000, 0)).toBe(false);
    });

    it("should reject salaries above maximum", () => {
      expect(validateSalary(20000000, 0, 10000000)).toBe(false);
    });

    it("should reject NaN", () => {
      expect(validateSalary(NaN)).toBe(false);
    });
  });
});

