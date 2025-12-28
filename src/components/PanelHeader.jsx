import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import ChevronUpIcon from "./icons/ChevronUpIcon";
import { KEYBOARD_SHORTCUTS } from "../utils/panelConstants";

/**
 * Panel header component with title and collapse functionality
 * @param {boolean} collapsed - Whether panel is collapsed
 * @param {Function} onToggle - Toggle collapse callback
 * @param {string} contentId - ID of content area for aria-controls
 */
export default function PanelHeader({ collapsed, onToggle, contentId }) {
  const handleToggle = useCallback(() => {
    onToggle((v) => !v);
  }, [onToggle]);

  const handleKeyDown = useCallback(
    (e) => {
      if (KEYBOARD_SHORTCUTS.toggle.includes(e.key)) {
        e.preventDefault();
        handleToggle();
      } else if (KEYBOARD_SHORTCUTS.collapse.includes(e.key) && !collapsed) {
        e.preventDefault();
        onToggle(true);
      }
    },
    [handleToggle, collapsed, onToggle]
  );

  // Add global keyboard shortcut for Escape
  useEffect(() => {
    if (collapsed) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onToggle(true);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [collapsed, onToggle]);

  return (
    <div
      className="title-row"
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={collapsed ? "Expand panel" : "Minimize panel"}
      aria-expanded={!collapsed}
      aria-controls={contentId}
    >
      <div className="title">H1B Wage Tracker</div>
      <div className="collapse-icon" title={collapsed ? "Expand (Enter/Space)" : "Minimize (Esc)"}>
        {collapsed ? (
          <ChevronDownIcon />
        ) : (
          <ChevronUpIcon />
        )}
      </div>
    </div>
  );
}

PanelHeader.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  contentId: PropTypes.string.isRequired,
};
