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
      // Check for both uppercase and lowercase 'a' or 'A', and also check keyCode for compatibility
      const isAKey = e.key === "A" || e.key === "a" || e.keyCode === 65;
      const isModifierPressed = e.ctrlKey || e.metaKey;
      
      if (isModifierPressed && e.shiftKey && isAKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Only allow admin panel when app is ready (not during welcome screen)
        if (appReady) {
          setShowAdminPanel((prev) => !prev);
        }
      }
    };

    // Use capture phase to catch the event early, before any other handlers
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
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
