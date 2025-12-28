import React from "react";
import Map from "./Map";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Map />
        <Analytics />
      </div>
    </ErrorBoundary>
  );
}
