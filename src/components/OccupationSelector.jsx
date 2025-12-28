import React from "react";
import SocAutocomplete from "../SocAutocomplete";

/**
 * Occupation selector component wrapper
 * @param {string} value - Current SOC text value
 * @param {Function} onSelect - Callback when occupation is selected
 */
export default function OccupationSelector({ value, onSelect }) {
  return (
    <div className="section">
      <label className="label" htmlFor="occupation-input">
        Occupation
      </label>

      <div className="row">
        <SocAutocomplete value={value} onSelect={onSelect} />

        <div className="info-wrapper">
          <span className="info-icon" aria-label="Help information" role="button" tabIndex={0}>
            i
          </span>

          <div className="info-tooltip" role="tooltip">
            <strong>Can't find your job title?</strong>
            <p>
              Try searching using a broader or more common job title. Many roles are grouped under
              standard occupational categories.
            </p>
            <p>
              For example, search for <em>Software Developer</em> instead of <em>Backend Engineer</em>
              , or <em>Operations Manager</em> instead of <em>Program Lead</em>.
            </p>
            <p>
              Once selected, adjust the salary to see which wage level applies by county.
            </p>
            <p>
              Use{" "}
              <a
                href="https://www.onetonline.org/find/result"
                target="_blank"
                rel="noopener noreferrer"
              >
                O*NET (Occupational Keyword Search)
              </a>{" "}
              to find more job titles and SOC codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

