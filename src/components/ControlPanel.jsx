import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/panelConstants";
import PanelHeader from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import PanelContent from "./PanelContent";

const CONTENT_ID = "panel-content";

/**
 * Control panel component containing all user controls
 * @param {string} socText - Current SOC text value
 * @param {Function} onSocSelect - SOC selection callback
 * @param {number} salary - Current salary value
 * @param {Function} onSalaryChange - Salary change callback
 * @param {boolean} salaryDisabled - Whether salary input is disabled
 * @param {Object} stats - Statistics object
 * @param {Function} onShare - Share button callback
 * @param {boolean} collapsed - Initial collapsed state (optional, defaults to localStorage)
 * @param {Function} onCollapseChange - Callback when collapse state changes (optional)
 */
export default function ControlPanel({
  socText,
  onSocSelect,
  salary,
  onSalaryChange,
  salaryDisabled = false,
  stats,
  onShare,
  collapsed: controlledCollapsed,
  onCollapseChange,
}) {
  // Use controlled or uncontrolled state with localStorage
  const [localCollapsed, setLocalCollapsed] = useLocalStorage(
    STORAGE_KEYS.panelCollapsed,
    false
  );

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : localCollapsed;

  const handleToggleCollapse = useCallback(
    (newValue) => {
      const valueToSet = typeof newValue === "function" ? newValue(collapsed) : newValue;
      if (isControlled) {
        onCollapseChange?.(valueToSet);
      } else {
        setLocalCollapsed(valueToSet);
      }
    },
    [collapsed, isControlled, onCollapseChange, setLocalCollapsed]
  );

  // Memoize share handler to prevent unnecessary re-renders
  const handleShare = useCallback(() => {
    onShare();
  }, [onShare]);

  return (
    <div className={`control-panel ${collapsed ? "collapsed" : ""}`}>
      <PanelHeader collapsed={collapsed} onToggle={handleToggleCollapse} contentId={CONTENT_ID} />

      {/* Content with smooth animation */}
      <div className={`panel-content-wrapper ${collapsed ? "collapsed" : ""}`}>
        {!collapsed && (
          <>
            <PanelContent
              id={CONTENT_ID}
              socText={socText}
              onSocSelect={onSocSelect}
              salary={salary}
              onSalaryChange={onSalaryChange}
              salaryDisabled={salaryDisabled}
              stats={stats}
            />
            <PanelFooter onShare={handleShare} />
          </>
        )}
      </div>
    </div>
  );
}

ControlPanel.propTypes = {
  socText: PropTypes.string.isRequired,
  onSocSelect: PropTypes.func.isRequired,
  salary: PropTypes.number.isRequired,
  onSalaryChange: PropTypes.func.isRequired,
  salaryDisabled: PropTypes.bool,
  stats: PropTypes.shape({
    level1: PropTypes.number,
    level2: PropTypes.number,
    level3: PropTypes.number,
    level4: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  onShare: PropTypes.func.isRequired,
  collapsed: PropTypes.bool,
  onCollapseChange: PropTypes.func,
};
