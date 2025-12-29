import React, { useState } from "react";
import PropTypes from "prop-types";
import { WAGE_LEVEL_GUIDE } from "../../data/educationContent";

/**
 * Interactive guide component explaining the four wage levels
 */
export default function WageLevelGuide() {
  const [expandedLevel, setExpandedLevel] = useState(null);

  const toggleLevel = (level) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  return (
    <div className="wage-level-guide">
      <div className="guide-overview">
        <p>{WAGE_LEVEL_GUIDE.overview}</p>
      </div>

      <div className="wage-levels-grid">
        {WAGE_LEVEL_GUIDE.levels.map((levelData) => (
          <div
            key={levelData.level}
            className={`wage-level-card ${expandedLevel === levelData.level ? "expanded" : ""}`}
            style={{ borderLeftColor: levelData.color }}
          >
            <button
              className="level-card-header"
              onClick={() => toggleLevel(levelData.level)}
              aria-expanded={expandedLevel === levelData.level}
              aria-controls={`level-${levelData.level}-details`}
            >
              <div className="level-header-content">
                <div className="level-badge" style={{ backgroundColor: levelData.color }}>
                  Level {levelData.level}
                </div>
                <div className="level-info">
                  <h3 className="level-name">{levelData.name}</h3>
                  <p className="level-description">{levelData.description}</p>
                </div>
              </div>
              <span className="expand-icon" aria-hidden="true">
                {expandedLevel === levelData.level ? "−" : "+"}
              </span>
            </button>

            {expandedLevel === levelData.level && (
              <div
                id={`level-${levelData.level}-details`}
                className="level-details"
                role="region"
                aria-labelledby={`level-${levelData.level}-header`}
              >
                <div className="detail-section">
                  <h4>Qualifications</h4>
                  <ul>
                    {levelData.qualifications.map((qual, idx) => (
                      <li key={idx}>{qual}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Experience</h4>
                  <p>{levelData.experience}</p>
                </div>

                <div className="detail-section">
                  <h4>Education</h4>
                  <p>{levelData.education}</p>
                </div>

                <div className="detail-section">
                  <h4>Example Positions</h4>
                  <ul>
                    {levelData.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Typical Duties</h4>
                  <ul>
                    {levelData.typicalDuties.map((duty, idx) => (
                      <li key={idx}>{duty}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="how-to-determine">
        <h2>{WAGE_LEVEL_GUIDE.howToDetermine.title}</h2>
        <div className="determine-steps">
          {WAGE_LEVEL_GUIDE.howToDetermine.steps.map((step) => (
            <div key={step.step} className="determine-step">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="determine-note">
          <p>
            <strong>Note:</strong> {WAGE_LEVEL_GUIDE.howToDetermine.note}
          </p>
        </div>
      </div>
    </div>
  );
}

WageLevelGuide.propTypes = {};
