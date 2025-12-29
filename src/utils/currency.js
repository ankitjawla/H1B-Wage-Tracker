/**
 * Currency formatting and parsing utilities
 */

/**
 * Formats a number as US currency with thousand separators
 * @param {number} n - The number to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (n) => (n || n === 0 ? n.toLocaleString("en-US") : "");

/**
 * Parses a currency string to a number, removing commas
 * @param {string|number} s - The currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (s) => Number(String(s).replace(/,/g, ""));

/**
 * Validates salary input
 * @param {number} salary - The salary to validate
 * @param {number} min - Minimum allowed salary (default: 0)
 * @param {number} max - Maximum allowed salary (default: 10000000)
 * @returns {boolean} True if valid
 */
export const validateSalary = (salary, min = 0, max = 10000000) => {
  return !Number.isNaN(salary) && salary >= min && salary <= max;
};


