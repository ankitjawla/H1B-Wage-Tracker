import { describe, it, expect } from "vitest";
import { computeLinePoints, pointsToPath } from "../chart";

describe("computeLinePoints", () => {
  const opts = { width: 100, height: 100, padX: 0, padY: 0 };

  it("returns empty for empty/invalid input", () => {
    expect(computeLinePoints([])).toEqual([]);
    expect(computeLinePoints(null)).toEqual([]);
  });

  it("centers a single point horizontally", () => {
    const pts = computeLinePoints([5], opts);
    expect(pts).toHaveLength(1);
    expect(pts[0].x).toBe(50); // width / 2
  });

  it("spreads points evenly across the width", () => {
    const pts = computeLinePoints([0, 1, 2], opts);
    expect(pts.map((p) => p.x)).toEqual([0, 50, 100]);
  });

  it("maps the max value to the top and min to the bottom", () => {
    const pts = computeLinePoints([0, 10], opts);
    // higher value → smaller y (top of the box)
    expect(pts[0].y).toBe(100); // min at bottom
    expect(pts[1].y).toBe(0); // max at top
  });

  it("renders a flat series through the vertical center", () => {
    const pts = computeLinePoints([7, 7, 7], opts);
    expect(pts.every((p) => p.y === 50)).toBe(true);
  });

  it("respects padding", () => {
    const pts = computeLinePoints([0, 10], { width: 100, height: 100, padX: 10, padY: 10 });
    expect(pts[0].x).toBe(10);
    expect(pts[1].x).toBe(90);
    expect(pts[1].y).toBe(10); // max, padY from top
    expect(pts[0].y).toBe(90); // min, padY from bottom
  });
});

describe("pointsToPath", () => {
  it("returns empty for no points", () => {
    expect(pointsToPath([])).toBe("");
  });

  it("builds an SVG path with a move then lines", () => {
    const path = pointsToPath([
      { x: 0, y: 10 },
      { x: 5, y: 20 },
      { x: 10, y: 0 },
    ]);
    expect(path).toBe("M0 10 L5 20 L10 0");
  });
});
