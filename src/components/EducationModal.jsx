import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import CloseIcon from "./icons/CloseIcon";
import WageLevelGuide from "./education/WageLevelGuide";
import PrevailingWageExplainer from "./education/PrevailingWageExplainer";
import H1BProcessEducation from "./education/H1BProcessEducation";
import FAQSection from "./education/FAQSection";
import "./EducationModal.css";

const TABS = [
  { id: "guide", label: "Wage Levels", component: WageLevelGuide },
  { id: "prevailing", label: "Prevailing Wage", component: PrevailingWageExplainer },
  { id: "h1b", label: "H1B Process", component: H1BProcessEducation },
  { id: "faq", label: "FAQ", component: FAQSection },
];

/**
 * Education modal component with tabbed navigation
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 */
export default function EducationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously active element
      previousActiveElementRef.current = document.activeElement;
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Return focus to the previously active element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle tab navigation with arrow keys
  const handleTabKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
        let newIndex;
        if (e.key === "ArrowLeft") {
          newIndex = currentIndex > 0 ? currentIndex - 1 : TABS.length - 1;
        } else {
          newIndex = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
        }
        setActiveTab(TABS[newIndex].id);
      }
    },
    [activeTab]
  );

  // Trap focus within modal
  const handleModalKeyDown = useCallback(
    (e) => {
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    []
  );

  if (!isOpen) return null;

  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component;

  return (
    <div
      className="education-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="education-modal-title"
    >
      <div
        ref={modalRef}
        className="education-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="education-modal-title">Education & Help</h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close education modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-tabs" role="tablist">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={isActive ? "modal-tab active" : "modal-tab"}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={handleTabKeyDown}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="modal-content">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              id={`tabpanel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              className={`tab-panel ${activeTab === tab.id ? "active" : ""}`}
              hidden={activeTab !== tab.id}
            >
              {activeTab === tab.id && ActiveComponent && <ActiveComponent />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

EducationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
