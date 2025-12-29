import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { COUNTRIES, getStatesForCountry, hasStatesData } from "../utils/locationData";
import { saveUserData, markWelcomeSeen } from "../utils/userTracking";
import "./WelcomeModal.css";

/**
 * Welcome modal component that collects user name and location
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onContinue - Callback when user continues (with or without data)
 */
export default function WelcomeModal({ isOpen, onContinue }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setCountry("");
      setState("");
      setErrors({});
    }
  }, [isOpen]);

  // Update state dropdown when country changes
  useEffect(() => {
    if (country && !hasStatesData(country)) {
      setState("");
    }
  }, [country]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleSkip();
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
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      saveUserData(name, {
        country: country,
        state: state || "",
      });
      markWelcomeSeen();

      // Small delay for better UX
      setTimeout(() => {
        setIsSubmitting(false);
        onContinue();
      }, 300);
    } catch (error) {
      console.error("Error saving user data:", error);
      setIsSubmitting(false);
      setErrors({ submit: "Failed to save data. Please try again." });
    }
  };

  const handleSkip = () => {
    markWelcomeSeen();
    onContinue();
  };

  if (!isOpen) return null;

  const states = getStatesForCountry(country);
  const showStateDropdown = country && hasStatesData(country);

  return (
    <div
      className="welcome-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="welcome-modal">
        <div className="welcome-header">
          <h2 id="welcome-modal-title">Welcome to H1B Wage Tracker</h2>
          <p className="welcome-subtitle">
            Help us improve by sharing your location (optional)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="form-group">
            <label htmlFor="welcome-name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              id="welcome-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Enter your name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="welcome-country" className="form-label">
              Country <span className="required">*</span>
            </label>
            <select
              id="welcome-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`form-select ${errors.country ? "error" : ""}`}
              aria-required="true"
              aria-invalid={!!errors.country}
              aria-describedby={errors.country ? "country-error" : undefined}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((countryName) => (
                <option key={countryName} value={countryName}>
                  {countryName}
                </option>
              ))}
            </select>
            {errors.country && (
              <span id="country-error" className="error-message" role="alert">
                {errors.country}
              </span>
            )}
          </div>

          {showStateDropdown && (
            <div className="form-group">
              <label htmlFor="welcome-state" className="form-label">
                State/Province <span className="optional">(Optional)</span>
              </label>
              <select
                id="welcome-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-select"
              >
                <option value="">Select a state/province</option>
                {states.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errors.submit && (
            <div className="error-message submit-error" role="alert">
              {errors.submit}
            </div>
          )}

          <div className="welcome-actions">
            <button
              type="button"
              onClick={handleSkip}
              className="btn-skip"
              disabled={isSubmitting}
            >
              Skip
            </button>
            <button
              type="submit"
              className="btn-continue"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>

        <div className="welcome-privacy">
          <p>
            Your information is stored locally in your browser and never shared.
            This helps us understand our user base.
          </p>
        </div>
      </div>
    </div>
  );
}

WelcomeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onContinue: PropTypes.func.isRequired,
};
