import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { USA_BOUNDS, WAGE_LEVEL_COLORS, WAGE_LEVEL_NAMES } from "../utils/constants";
import { STATE_FP_TO_ABBR } from "../stateFpToAbbr";
import { validateEnv } from "../utils/env";

// Validate and set Mapbox token
try {
  validateEnv();
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
} catch (error) {
  console.error("Environment validation failed:", error.message);
}

/**
 * Custom hook for managing Mapbox map instance
 * @param {Function} onMapLoad - Callback when map is loaded
 * @returns {Object} Map reference and loading state
 */
export function useMapboxMap(onMapLoad) {
  const mapRef = useRef(null);
  const countiesRef = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;

    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      setMapError("Mapbox token is missing. Please configure VITE_MAPBOX_TOKEN.");
      setMapLoading(false);
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v11",
        bounds: USA_BOUNDS,
        fitBoundsOptions: { padding: 20 },
      });

      mapRef.current = map;

      map.on("load", async () => {
        try {
          setMapLoading(true);
          const countyRes = await fetch("/counties.geojson");
          
          if (!countyRes.ok) {
            throw new Error("Failed to load county data");
          }

          const counties = await countyRes.json();
          countiesRef.current = counties;

          map.addSource("counties", {
            type: "geojson",
            data: counties,
          });

          map.addLayer({
            id: "county-fill",
            type: "fill",
            source: "counties",
            paint: {
              "fill-color": "#F3F4F6",
              "fill-opacity": 0.85,
            },
          });

          map.addLayer({
            id: "county-outline",
            type: "line",
            source: "counties",
            paint: {
              "line-color": "#ffffff",
              "line-width": 0.3,
            },
          });

          // County click handler
          map.on("click", "county-fill", (e) => {
            const f = e.features?.[0];
            if (!f) return;

            const state = STATE_FP_TO_ABBR[f.properties.STATEFP];
            const level = f.properties.level ?? "< 1";

            const color = WAGE_LEVEL_COLORS[level] || WAGE_LEVEL_COLORS.default;
            const levelName = WAGE_LEVEL_NAMES[level] || WAGE_LEVEL_NAMES.default;

            // Sanitize HTML to prevent XSS
            const countyName = f.properties.NAME || "Unknown";
            const stateAbbr = state || "N/A";

            // Annual Level I–IV thresholds attached by useWageLevels; numeric
            // only, so safe to interpolate after formatting
            const thresholds = [
              ["I", f.properties.wageI],
              ["II", f.properties.wageII],
              ["III", f.properties.wageIII],
              ["IV", f.properties.wageIV],
            ].filter(([, v]) => Number.isFinite(v));

            const thresholdRows = thresholds
              .map(
                ([lvl, v]) =>
                  `<tr>
                    <td style="padding: 2px 12px 2px 0; color: #6b7280;">Level ${lvl}</td>
                    <td style="padding: 2px 0; text-align: right; font-weight: 600; color: #111827;">$${Number(v).toLocaleString("en-US")}</td>
                  </tr>`
              )
              .join("");

            const thresholdSection = thresholdRows
              ? `<div style="margin-top: 8px; padding: 8px; background: #F9FAFB; border-radius: 4px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Annual prevailing wage thresholds</div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">${thresholdRows}</table>
                </div>`
              : "";

            new mapboxgl.Popup({ maxWidth: "300px" })
              .setLngLat(e.lngLat)
              .setHTML(
                `<div style="padding: 4px;">
                  <strong style="font-size: 16px; color: #111827;">${countyName}, ${stateAbbr}</strong><br/>
                  <div style="margin-top: 8px; padding: 8px; background: ${color}20; border-left: 3px solid ${color}; border-radius: 4px;">
                    <div style="font-size: 14px; color: #6b7280;">Wage Level</div>
                    <div style="font-size: 20px; font-weight: 700; color: ${color}; margin-top: 4px;">
                      Level ${level} <span style="font-size: 12px; font-weight: 500;">(${levelName})</span>
                    </div>
                  </div>
                  ${thresholdSection}
                </div>`
              )
              .addTo(map);
          });

          map.on("mouseenter", "county-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });

          map.on("mouseleave", "county-fill", () => {
            map.getCanvas().style.cursor = "";
          });

          if (onMapLoad) {
            onMapLoad();
          }

          setMapLoading(false);
        } catch (err) {
          console.error("Error loading map data:", err);
          setMapError(err.message || "Failed to load map data");
          setMapLoading(false);
        }
      });

      map.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError("Map rendering error occurred");
        setMapLoading(false);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setMapError(err.message || "Failed to initialize map");
      setMapLoading(false);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapLoad]);

  return { mapRef, countiesRef, mapLoading, mapError };
}

