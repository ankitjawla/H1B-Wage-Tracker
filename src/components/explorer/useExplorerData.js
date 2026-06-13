import { useEffect, useRef, useState } from "react";
import { fetchData } from "../../utils/api";

/**
 * Loads a Data Explorer endpoint and reports its data source upward.
 * @param {string} endpoint   one of the /api/* endpoints
 * @param {Object} params     query parameters (shallow-compared via JSON)
 * @param {Function} onSource called with "live" | "sample" after each load
 * @param {boolean} [enabled] skip fetching when false (e.g. empty search)
 * @returns {{ data: Object|null, loading: boolean }}
 */
export function useExplorerData(endpoint, params, onSource, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const key = JSON.stringify(params);
  const onSourceRef = useRef(onSource);
  onSourceRef.current = onSource;

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    fetchData(endpoint, params).then(({ data: d, source }) => {
      if (cancelled) return;
      setData(d);
      setLoading(false);
      onSourceRef.current?.(source);
    });
    return () => {
      cancelled = true;
    };
    // params is serialized via `key` to avoid identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, key, enabled]);

  return { data, loading };
}
