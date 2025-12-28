import React from "react";

/**
 * Loading indicator component
 * @param {string} message - Optional loading message
 */
export default function LoadingIndicator({ message = "Loading..." }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        padding: "20px 30px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #8B5CF6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
        aria-hidden="true"
      />
      <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

