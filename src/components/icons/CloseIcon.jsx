import React from "react";
import PropTypes from "prop-types";

/**
 * Close icon component (X)
 * @param {number} width - Icon width (default: 24)
 * @param {number} height - Icon height (default: 24)
 * @param {string} fill - Fill color (default: currentColor)
 */
export default function CloseIcon({ width = 24, height = 24, fill = "currentColor" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

CloseIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
};
