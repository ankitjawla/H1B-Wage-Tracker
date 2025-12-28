import React from "react";

/**
 * Share icon component
 * @param {number} width - Icon width (default: 18)
 * @param {number} height - Icon height (default: 18)
 * @param {string} fill - Fill color (default: currentColor)
 */
export default function ShareIcon({ width = 18, height = 18, fill = "currentColor" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.5 2.5 0 000-1.39l7.02-4.11A2.99 2.99 0 0018 7.91a3 3 0 10-3-3c0 .23.03.45.08.66L8.05 9.7a3 3 0 100 4.61l7.02 4.11c-.05.2-.07.41-.07.63a3 3 0 103-3z" />
    </svg>
  );
}
