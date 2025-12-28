import React from "react";

/**
 * GitHub icon component
 * @param {number} width - Icon width (default: 18)
 * @param {number} height - Icon height (default: 18)
 * @param {string} fill - Fill color (default: currentColor)
 */
export default function GitHubIcon({ width = 18, height = 18, fill = "currentColor" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.55-3.87-1.55-.53-1.36-1.29-1.72-1.29-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.45.11-3.02 0 0 .97-.31 3.18 1.18a11.07 11.07 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.57.23 2.73.11 3.02.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56 4.56-1.53 7.85-5.86 7.85-10.96C23.5 5.74 18.27.5 12 .5z" />
    </svg>
  );
}
