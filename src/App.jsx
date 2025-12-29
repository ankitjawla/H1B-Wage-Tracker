import React, { useState, useEffect } from "react";
import Map from "./Map";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/ErrorBoundary";
import WelcomeModal from "./components/WelcomeModal";
import AdminPanel from "./components/AdminPanel";
import { hasSeenWelcome } from "./utils/userTracking";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Check if user has seen welcome screen on mount
  useEffect(() => {
    if (!hasSeenWelcome()) {
      setShowWelcome(true);
    } else {
      setAppReady(true);
    }
  }, []);

  // Admin panel keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+A (Windows/Linux) or Cmd+Shift+A (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        // Only allow admin panel when app is ready (not during welcome screen)
        if (appReady) {
          setShowAdminPanel((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [appReady]);

  const handleWelcomeContinue = () => {
    setShowWelcome(false);
    setAppReady(true);
  };

  const handleAdminPanelClose = () => {
    setShowAdminPanel(false);
  };

  return (
    <ErrorBoundary>
      <div style={{ width: "100vw", height: "100vh" }}>
        {appReady && <Map />}
        <WelcomeModal isOpen={showWelcome} onContinue={handleWelcomeContinue} />
        <AdminPanel isOpen={showAdminPanel} onClose={handleAdminPanelClose} />
        <Analytics />
      </div>
    </ErrorBoundary>
  );
}
