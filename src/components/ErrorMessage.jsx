import React from "react";

/**
 * Error message component
 * @param {string} message - Error message to display
 * @param {Function} onDismiss - Optional callback to dismiss error
 */
export default function ErrorMessage({ message, onDismiss }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 1000,
        background: "#fee2e2",
        border: "1px solid #fca5a5",
        borderRadius: "12px",
        padding: "12px 16px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
      role="alert"
      aria-live="assertive"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#dc2626"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#991b1b", marginBottom: "4px" }}>
          Error
        </div>
        <div style={{ fontSize: "13px", color: "#7f1d1d" }}>{message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}



