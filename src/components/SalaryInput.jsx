import React, { useCallback } from "react";
import { formatCurrency, parseCurrency, validateSalary } from "../utils/currency";

/**
 * Salary input component with currency formatting
 * @param {number} value - Current salary value
 * @param {Function} onChange - Callback when salary changes
 * @param {boolean} disabled - Whether input is disabled
 */
export default function SalaryInput({ value, onChange, disabled = false }) {
  const handleChange = useCallback(
    (e) => {
      const raw = parseCurrency(e.target.value);
      if (!Number.isNaN(raw) && validateSalary(raw)) {
        onChange(raw);
      }
    },
    [onChange]
  );

  return (
    <div className="salary-input">
      <span aria-hidden="true">$</span>
      <input
        type="text"
        value={formatCurrency(value)}
        inputMode="numeric"
        onChange={handleChange}
        disabled={disabled}
        aria-label="Annual base salary in US dollars"
        aria-required="true"
      />
    </div>
  );
}



