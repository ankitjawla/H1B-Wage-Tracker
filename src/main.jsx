import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";
import { validateEnv } from "./utils/env";

// Validate environment variables before rendering
try {
  validateEnv();
} catch (error) {
  console.error("Environment validation failed:", error.message);
  // Show user-friendly error in production
  if (import.meta.env.PROD) {
    document.getElementById("root").innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; padding: 20px; font-family: system-ui, sans-serif;">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h1>
          <p style="color: #6b7280; margin-bottom: 8px;">${error.message}</p>
          <p style="color: #6b7280; font-size: 14px;">Please check your .env file and ensure VITE_MAPBOX_TOKEN is set.</p>
        </div>
      </div>
    `;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
