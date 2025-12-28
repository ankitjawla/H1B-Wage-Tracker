import React from "react";

/**
 * Chevron up icon component
 * @param {number} width - Icon width (default: 18)
 * @param {number} height - Icon height (default: 18)
 * @param {string} fill - Fill color (default: currentColor)
 */
export default function ChevronUpIcon({ width = 18, height = 18, fill = "currentColor" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M6 15l6-6 6 6H6z" />
    </svg>
  );
}
