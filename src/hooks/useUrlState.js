import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing URL query parameters
 * @param {string} key - The query parameter key
 * @param {any} defaultValue - Default value if not in URL
 * @param {Function} parse - Function to parse URL value
 * @param {Function} serialize - Function to serialize value to URL
 * @returns {[any, Function]} State value and setter function
 */
export function useUrlState(key, defaultValue, parse = (v) => v, serialize = (v) => v) {
  const [value, setValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get(key);
    return urlValue !== null ? parse(urlValue) : defaultValue;
  });

  const updateUrl = useCallback(
    (newValue) => {
      const params = new URLSearchParams(window.location.search);
      const serialized = serialize(newValue);
      
      if (serialized === null || serialized === undefined || serialized === "") {
        params.delete(key);
      } else {
        params.set(key, serialized);
      }

      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
      setValue(newValue);
    },
    [key, serialize]
  );

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlValue = params.get(key);
      setValue(urlValue !== null ? parse(urlValue) : defaultValue);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [key, defaultValue, parse]);

  return [value, updateUrl];
}

