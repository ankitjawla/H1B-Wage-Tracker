import React, { useEffect, useState, useCallback } from "react";
import { useMapboxMap } from "./hooks/useMapboxMap";
import { useWageLevels } from "./hooks/useWageLevels";
import { useDebounce } from "./hooks/useDebounce";
import { validateSalary } from "./utils/currency";
import ControlPanel from "./components/ControlPanel";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import EducationModal from "./components/EducationModal";
import "./Map.css";

const DEFAULT_SOC = "11-1011";
const DEFAULT_SOC_TEXT = "11-1011 – Chief Executives";
const DEFAULT_SALARY = 150000;

// SOC codes follow the "##-####" pattern; reject anything else so URL values
// can never produce arbitrary fetch paths
const SOC_PATTERN = /^\d{2}-\d{4}$/;

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);

  const socParam = params.get("soc");
  const soc = socParam && SOC_PATTERN.test(socParam) ? socParam : DEFAULT_SOC;

  const salaryParam = Number(params.get("salary"));
  const salary =
    Number.isFinite(salaryParam) && salaryParam > 0 && validateSalary(salaryParam)
      ? salaryParam
      : DEFAULT_SALARY;

  return { soc, salary };
}

export default function Map() {
  const [initialUrlState] = useState(readUrlParams);
  const [soc, setSoc] = useState(initialUrlState.soc);
  const [socText, setSocText] = useState(
    initialUrlState.soc === DEFAULT_SOC ? DEFAULT_SOC_TEXT : initialUrlState.soc
  );
  const [salary, setSalary] = useState(initialUrlState.salary);
  const [showEducationModal, setShowEducationModal] = useState(false);

  // Debounce salary input to prevent excessive API calls
  const debouncedSalary = useDebounce(salary, 300);

  // Initialize map
  const { mapRef, countiesRef, mapLoading, mapError } = useMapboxMap();

  // Wage level calculations
  const { updateLevels, stats, loading, error, clearError } = useWageLevels(mapRef, countiesRef);

  // Resolve the occupation title when the SOC code was restored from the URL
  useEffect(() => {
    if (initialUrlState.soc === DEFAULT_SOC) return;

    fetch("/data/soc_codes.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load SOC codes"))))
      .then((options) => {
        const match = options.find((o) => o.parent === initialUrlState.soc);
        if (match) {
          setSocText(`${initialUrlState.soc} – ${match.title}`);
        }
      })
      .catch((err) => {
        console.error("Failed to resolve SOC title from URL:", err);
      });
  }, [initialUrlState.soc]);

  // Keep the URL in sync so the current view is shareable / bookmarkable.
  // Uses replaceState (no history spam) and the debounced salary to avoid
  // rewriting the URL on every keystroke.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("soc", soc);
    params.set("salary", String(debouncedSalary));
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [soc, debouncedSalary]);

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

  // Handle education modal
  const handleOpenEducation = useCallback(() => {
    setShowEducationModal(true);
  }, []);

  const handleCloseEducation = useCallback(() => {
    setShowEducationModal(false);
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
        onHelpClick={handleOpenEducation}
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

      {/* Education Modal */}
      <EducationModal isOpen={showEducationModal} onClose={handleCloseEducation} />

      <div id="map" />
    </>
  );
}
