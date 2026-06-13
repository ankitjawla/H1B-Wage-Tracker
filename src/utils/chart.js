/**
 * Pure geometry helpers for the dependency-free SVG trend charts.
 */

/**
 * Map a series of numeric values to SVG coordinates within a box.
 * Values are scaled across the full series range (min→max); a flat series
 * renders along the vertical center. A single point is centered horizontally.
 *
 * @param {number[]} values
 * @param {{ width?: number, height?: number, padX?: number, padY?: number }} [opts]
 * @returns {Array<{ x: number, y: number }>}
 */
export function computeLinePoints(values, opts = {}) {
  const { width = 280, height = 72, padX = 6, padY = 8 } = opts;
  if (!Array.isArray(values) || values.length === 0) return [];

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const n = values.length;
  const round = (v) => Math.round(v * 100) / 100;

  return values.map((v, i) => {
    const x = n === 1 ? width / 2 : padX + (i / (n - 1)) * innerW;
    // No range → flat line through the vertical center
    const t = range === 0 ? 0.5 : (v - min) / range;
    const y = padY + (1 - t) * innerH;
    return { x: round(x), y: round(y) };
  });
}

/**
 * Convert points to an SVG path `d` string (polyline).
 * @param {Array<{ x: number, y: number }>} points
 * @returns {string}
 */
export function pointsToPath(points) {
  if (!Array.isArray(points) || points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
}
