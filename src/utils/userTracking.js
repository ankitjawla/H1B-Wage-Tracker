/**
 * User tracking utilities for localStorage
 */

const STORAGE_KEY = "h1b-wage-tracker-users";
const USER_SESSION_KEY = "h1b-wage-tracker-session";
const WELCOME_SEEN_KEY = "h1b-wage-tracker-welcome-seen";

/**
 * Generate a UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a session ID
 * @returns {string} Session ID
 */
function getSessionId() {
  let sessionId = localStorage.getItem(USER_SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(USER_SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Check if welcome screen has been seen (user provided data or skipped)
 * @returns {boolean} True if welcome screen has been seen
 */
export function hasSeenWelcome() {
  return localStorage.getItem(WELCOME_SEEN_KEY) === "true";
}

/**
 * Mark welcome screen as seen
 */
export function markWelcomeSeen() {
  localStorage.setItem(WELCOME_SEEN_KEY, "true");
}

/**
 * Check if current user has provided data
 * @returns {boolean} True if user data exists
 */
export function hasUserData() {
  const sessionId = getSessionId();
  const users = getAllUsers();
  return users.some((user) => user.sessionId === sessionId);
}

/**
 * Save user data to localStorage
 * @param {string} name - User's name
 * @param {Object} location - Location object with country and optional state
 * @param {string} location.country - Country name
 * @param {string} [location.state] - State/province name (optional)
 */
export function saveUserData(name, location) {
  const users = getAllUsers();
  const sessionId = getSessionId();

  const userData = {
    id: generateUUID(),
    name: name.trim(),
    location: {
      country: location.country,
      state: location.state || "",
    },
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    sessionId: sessionId,
  };

  users.push(userData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Get all stored user data
 * @returns {Array} Array of user objects
 */
export function getAllUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading user data from localStorage:", error);
    return [];
  }
}

/**
 * Get total number of users
 * @returns {number} Total user count
 */
export function getUserCount() {
  return getAllUsers().length;
}

/**
 * Get unique countries from user data
 * @returns {Array} Array of unique country names
 */
export function getUniqueCountries() {
  const users = getAllUsers();
  const countries = new Set(users.map((user) => user.location.country));
  return Array.from(countries).sort();
}

/**
 * Get statistics about collected data
 * @returns {Object} Statistics object
 */
export function getStatistics() {
  const users = getAllUsers();
  const countries = getUniqueCountries();
  
  // Count users by country
  const countryCounts = {};
  users.forEach((user) => {
    const country = user.location.country;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  // Get most common countries
  const sortedCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  // Get date range
  const timestamps = users.map((u) => new Date(u.timestamp)).sort((a, b) => a - b);
  const firstUser = timestamps[0];
  const lastUser = timestamps[timestamps.length - 1];

  return {
    totalUsers: users.length,
    uniqueCountries: countries.length,
    countryCounts: countryCounts,
    mostCommonCountries: sortedCountries,
    firstUserDate: firstUser ? firstUser.toISOString() : null,
    lastUserDate: lastUser ? lastUser.toISOString() : null,
  };
}

/**
 * Export user data as JSON file
 */
export function exportAsJSON() {
  const users = getAllUsers();
  const dataStr = JSON.stringify(users, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `h1b-users-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export user data as CSV file
 */
export function exportAsCSV() {
  const users = getAllUsers();
  
  // CSV headers
  const headers = ["ID", "Name", "Country", "State", "Timestamp", "User Agent"];
  
  // Escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV rows
  const rows = users.map((user) => [
    escapeCSV(user.id),
    escapeCSV(user.name),
    escapeCSV(user.location.country),
    escapeCSV(user.location.state),
    escapeCSV(user.timestamp),
    escapeCSV(user.userAgent),
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  // Create and download file
  const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `h1b-users-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clear all user data
 * @returns {boolean} True if data was cleared
 */
export function clearAllUsers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WELCOME_SEEN_KEY);
    // Optionally clear session ID too
    // localStorage.removeItem(USER_SESSION_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing user data:", error);
    return false;
  }
}
