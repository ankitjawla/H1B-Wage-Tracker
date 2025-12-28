import React, { useEffect, useState, useCallback } from "react";
import { useMapboxMap } from "./hooks/useMapboxMap";
import { useWageLevels } from "./hooks/useWageLevels";
import { useDebounce } from "./hooks/useDebounce";
import ControlPanel from "./components/ControlPanel";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import "./Map.css";

export default function Map() {
  const [soc, setSoc] = useState("11-1011");
  const [socText, setSocText] = useState("11-1011 – Chief Executives");
  const [salary, setSalary] = useState(150000);

  // Debounce salary input to prevent excessive API calls
  const debouncedSalary = useDebounce(salary, 300);

  // Initialize map
  const { mapRef, countiesRef, mapLoading, mapError } = useMapboxMap();

  // Wage level calculations
  const { updateLevels, stats, loading, error, clearError } = useWageLevels(mapRef, countiesRef);

  // Update wage levels when SOC or salary changes, or when map is ready
  useEffect(() => {
    if (mapRef.current && countiesRef.current && !mapLoading) {
      updateLevels(soc, debouncedSalary);
    }
  }, [soc, debouncedSalary, updateLevels, mapRef, countiesRef, mapLoading]);

  // Handle share functionality
  const handleShare = useCallback(() => {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "H1B Wage Tracker",
        text: "Check prevailing wage levels by county",
        url,
      }).catch((err) => {
        // Fallback to clipboard if share fails
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(url).then(() => {
            alert("Link copied to clipboard");
          });
        }
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard");
      }).catch(() => {
        console.error("Failed to copy to clipboard");
      });
    }
  }, []);

  // Handle SOC selection
  const handleSocSelect = useCallback((code, display) => {
    setSoc(code);
    setSocText(display);
  }, []);

  // Show error if map failed to load
  if (mapError) {
    return (
      <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ErrorMessage message={mapError} />
      </div>
    );
  }

  return (
    <>
      <ControlPanel
        socText={socText}
        onSocSelect={handleSocSelect}
        salary={salary}
        onSalaryChange={setSalary}
        stats={stats}
        onShare={handleShare}
        salaryDisabled={loading || mapLoading}
      />

      {/* Show loading indicator during map initialization or wage data loading */}
      {(mapLoading || loading) && (
        <LoadingIndicator
          message={mapLoading ? "Loading map..." : "Loading wage data..."}
        />
      )}

      {/* Show error message for wage data loading errors */}
      {error && (
        <ErrorMessage message={error} onDismiss={clearError} />
      )}

      <div id="map" />
    </>
  );
}
