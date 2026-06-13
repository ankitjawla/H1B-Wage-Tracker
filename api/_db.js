// Shared Neon/Postgres helper for the serverless API routes.
//
// Files prefixed with "_" are NOT exposed as routes by Vercel, so this module
// is import-only. The Vercel Neon integration provides DATABASE_URL (and a few
// aliases); we accept the common ones so the app works regardless of which the
// integration set.
import { neon } from "@neondatabase/serverless";

const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  null;

let sqlClient = null;

/**
 * Returns true when a database connection string is configured.
 * Lets routes respond with a clear "not configured" signal instead of 500s.
 */
export function isDbConfigured() {
  return Boolean(CONNECTION_STRING);
}

/**
 * Lazily-created Neon SQL tagged-template client.
 * @returns {import("@neondatabase/serverless").NeonQueryFunction<false, false>}
 */
export function getSql() {
  if (!CONNECTION_STRING) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!sqlClient) {
    sqlClient = neon(CONNECTION_STRING);
  }
  return sqlClient;
}

/**
 * Wraps a route handler with shared concerns: JSON headers, edge-cache hints,
 * a graceful "unconfigured" response, and uniform error handling.
 *
 * The handler receives (req, res, sql). When the DB is not configured the
 * handler is skipped and a 200 `{ configured: false }` body is returned so the
 * frontend can fall back to clearly-labeled sample data.
 *
 * @param {(req, res, sql) => Promise<any>} handler
 */
export function withDb(handler) {
  return async function wrapped(req, res) {
    res.setHeader("Content-Type", "application/json");
    // Cache successful aggregate responses at the edge for a few minutes;
    // disclosure data only changes on quarterly/annual releases.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=86400"
    );

    if (!isDbConfigured()) {
      res.status(200).json({ configured: false, source: "unconfigured" });
      return;
    }

    try {
      const sql = getSql();
      const payload = await handler(req, res, sql);
      if (payload !== undefined && !res.writableEnded) {
        res.status(200).json({ configured: true, source: "live", ...payload });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("API error:", err);
      if (!res.writableEnded) {
        res
          .status(500)
          .json({ configured: true, source: "error", error: "Internal error" });
      }
    }
  };
}

/** Coerce a query param to a trimmed string, or return a default. */
export function str(value, fallback = "") {
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value.trim() : fallback;
}

/** Coerce a query param to a bounded positive integer. */
export function int(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  if (Array.isArray(value)) value = value[0];
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return fallback;
  return Math.min(n, max);
}
