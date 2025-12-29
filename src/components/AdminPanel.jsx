import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import CloseIcon from "./icons/CloseIcon";
import {
  getAllUsers,
  getUserCount,
  getStatistics,
  exportAsJSON,
  exportAsCSV,
  clearAllUsers,
} from "../utils/userTracking";
import "./AdminPanel.css";

/**
 * Admin panel component for viewing and exporting user data
 * @param {boolean} isOpen - Whether the panel is open
 * @param {Function} onClose - Callback to close the panel
 */
export default function AdminPanel({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const panelRef = useRef(null);

  // Load data when panel opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        if (showClearConfirm) {
          setShowClearConfirm(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, showClearConfirm, onClose]);

  const loadData = () => {
    const userData = getAllUsers();
    const stats = getStatistics();
    setUsers(userData);
    setStatistics(stats);
  };

  const handleExportJSON = () => {
    try {
      exportAsJSON();
    } catch (error) {
      console.error("Error exporting JSON:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleExportCSV = () => {
    try {
      exportAsCSV();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleClearData = () => {
    if (showClearConfirm) {
      const success = clearAllUsers();
      if (success) {
        setUsers([]);
        setStatistics(null);
        setShowClearConfirm(false);
        alert("All user data has been cleared.");
      } else {
        alert("Failed to clear data. Please try again.");
      }
    } else {
      setShowClearConfirm(true);
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-panel-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !showClearConfirm) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-panel-title"
    >
      <div
        ref={panelRef}
        className="admin-panel"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="admin-header">
          <h2 id="admin-panel-title">Admin Panel</h2>
          <button
            type="button"
            onClick={onClose}
            className="admin-close-btn"
            aria-label="Close admin panel"
            disabled={showClearConfirm}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="admin-content">
          {statistics && (
            <div className="admin-stats">
              <div className="stat-item">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{statistics.totalUsers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Countries</span>
                <span className="stat-value">{statistics.uniqueCountries}</span>
              </div>
              {statistics.mostCommonCountries.length > 0 && (
                <div className="stat-item stat-item-wide">
                  <span className="stat-label">Top Countries</span>
                  <div className="stat-countries">
                    {statistics.mostCommonCountries.map((item, idx) => (
                      <span key={idx} className="country-badge">
                        {item.country} ({item.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {users.length === 0 ? (
            <div className="admin-empty">
              <p>No user data collected yet.</p>
              <p className="admin-empty-hint">
                Users will appear here after they provide information on the welcome screen.
              </p>
            </div>
          ) : (
            <div className="admin-users">
              <div className="users-header">
                <h3>User Data ({users.length})</h3>
              </div>
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Country</th>
                      <th>State</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.location.country}</td>
                        <td>{user.location.state || "—"}</td>
                        <td>{formatDate(user.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="admin-actions">
            <button
              type="button"
              onClick={handleExportJSON}
              className="admin-btn admin-btn-export"
              disabled={users.length === 0}
            >
              Export as JSON
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="admin-btn admin-btn-export"
              disabled={users.length === 0}
            >
              Export as CSV
            </button>
            <button
              type="button"
              onClick={loadData}
              className="admin-btn admin-btn-refresh"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleClearData}
              className="admin-btn admin-btn-clear"
              disabled={users.length === 0}
            >
              {showClearConfirm ? "Confirm Clear" : "Clear All Data"}
            </button>
          </div>

          {showClearConfirm && (
            <div className="admin-confirm">
              <p>Are you sure you want to clear all user data? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="admin-btn admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="admin-btn admin-btn-confirm"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          )}

          <div className="admin-hint">
            <p>
              <strong>Keyboard Shortcut:</strong> Press <kbd>Ctrl+Shift+A</kbd> (or{" "}
              <kbd>Cmd+Shift+A</kbd> on Mac) to open this panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

AdminPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
