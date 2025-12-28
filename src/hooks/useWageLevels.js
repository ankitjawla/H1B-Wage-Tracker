import { useState, useCallback } from "react";
import { HOURS_PER_YEAR, MAP_PAINT_COLORS } from "../utils/constants";
import { normalize } from "../utils/normalize";
import { STATE_FP_TO_ABBR } from "../stateFpToAbbr";

/**
 * Custom hook for calculating wage levels
 * @param {Object} mapRef - Reference to mapbox map instance
 * @param {Object} countiesRef - Reference to counties GeoJSON data
 * @returns {Object} Wage level calculation functions and state
 */
export function useWageLevels(mapRef, countiesRef) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    total: 0,
  });

  const updateLevels = useCallback(
    async (selectedSoc, annualSalary) => {
      if (!mapRef.current || !countiesRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const hourly = annualSalary / HOURS_PER_YEAR;

        const socRes = await fetch(`/data/soc/${selectedSoc}.json`);
        if (!socRes.ok) {
          throw new Error(`Failed to load wage data for SOC ${selectedSoc}`);
        }

        const wageTable = await socRes.json();
        const counties = structuredClone(countiesRef.current);

        const statsCount = { level1: 0, level2: 0, level3: 0, level4: 0, total: 0 };

        counties.features.forEach((f) => {
          delete f.properties.level;

          const state = STATE_FP_TO_ABBR[f.properties.STATEFP];
          if (!state) return;

          const key = `${state}|${normalize(`${f.properties.NAME} County`)}`;
          const levels = wageTable[key];
          if (!levels) return;

          let level = null;
          if (levels.IV && hourly >= levels.IV) level = 4;
          else if (levels.III && hourly >= levels.III) level = 3;
          else if (levels.II && hourly >= levels.II) level = 2;
          else if (levels.I && hourly >= levels.I) level = 1;

          if (level !== null) {
            f.properties.level = level;
            statsCount[`level${level}`]++;
            statsCount.total++;
          }
        });

        setStats(statsCount);

        const src = mapRef.current.getSource("counties");
        if (src) src.setData(counties);

        mapRef.current.setPaintProperty("county-fill", "fill-color", [
          "case",
          ["==", ["get", "level"], 4],
          MAP_PAINT_COLORS[4],
          ["==", ["get", "level"], 3],
          MAP_PAINT_COLORS[3],
          ["==", ["get", "level"], 2],
          MAP_PAINT_COLORS[2],
          ["==", ["get", "level"], 1],
          MAP_PAINT_COLORS[1],
          MAP_PAINT_COLORS.default,
        ]);
      } catch (err) {
        console.error("Error updating wage levels:", err);
        setError(err.message || "Failed to update wage levels");
      } finally {
        setLoading(false);
      }
    },
    [mapRef, countiesRef]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { updateLevels, stats, loading, error, clearError };
}
