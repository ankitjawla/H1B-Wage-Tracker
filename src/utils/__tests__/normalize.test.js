import { describe, it, expect } from "vitest";
import { normalize } from "../normalize";

describe("normalize utility", () => {
  it("should remove 'county' from string", () => {
    expect(normalize("Cook County")).toBe("cook");
    expect(normalize("Los Angeles County")).toBe("los angeles");
  });

  it("should normalize whitespace", () => {
    expect(normalize("New  York  County")).toBe("new york");
    expect(normalize("  Cook  County  ")).toBe("cook");
  });

  it("should convert to lowercase", () => {
    expect(normalize("COOK COUNTY")).toBe("cook");
  });

  it("should handle strings without 'county'", () => {
    expect(normalize("Cook")).toBe("cook");
    expect(normalize("New York")).toBe("new york");
  });

  it("should handle empty strings", () => {
    expect(normalize("")).toBe("");
  });
});



