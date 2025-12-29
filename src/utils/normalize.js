/**
 * County name normalization utilities
 * Must match preprocessing normalization
 */

/**
 * Normalizes a county name for matching
 * @param {string} s - The county name to normalize
 * @returns {string} Normalized county name
 */
export const normalize = (s) =>
  s.toLowerCase().replace(" county", "").replace(/\s+/g, " ").trim();


