/**
 * Environment variable validation utilities
 */

/**
 * Validates that required environment variables are set
 * @throws {Error} If required environment variables are missing
 */
export function validateEnv() {
  const requiredVars = {
    VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Please check your .env file and ensure all required variables are set."
    );
  }
}

/**
 * Gets environment variable with optional default
 * @param {string} key - Environment variable key
 * @param {any} defaultValue - Default value if not set
 * @returns {any} Environment variable value or default
 */
export function getEnv(key, defaultValue = null) {
  return import.meta.env[key] || defaultValue;
}


