import React from "react";
import PropTypes from "prop-types";

/**
 * Help icon component (question mark in circle)
 * @param {number} width - Icon width (default: 18)
 * @param {number} height - Icon height (default: 18)
 * @param {string} fill - Fill color (default: currentColor)
 */
export default function HelpIcon({ width = 18, height = 18, fill = "currentColor" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke={fill} strokeWidth="2" fill="none" />
      <path
        d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="12" cy="17" r="1" fill={fill} />
    </svg>
  );
}

HelpIcon.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  fill: PropTypes.string,
};
