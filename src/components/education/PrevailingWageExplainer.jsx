import React from "react";
import PropTypes from "prop-types";
import { PREVAILING_WAGE_EXPLAINER } from "../../data/educationContent";

/**
 * Component explaining what prevailing wages are
 */
export default function PrevailingWageExplainer() {
  return (
    <div className="prevailing-wage-explainer">
      <section className="explainer-section">
        <h2>{PREVAILING_WAGE_EXPLAINER.definition.title}</h2>
        <p className="explainer-content">{PREVAILING_WAGE_EXPLAINER.definition.content}</p>
      </section>

      <section className="explainer-section">
        <h2>{PREVAILING_WAGE_EXPLAINER.whyItMatters.title}</h2>
        <div className="explainer-content">
          {PREVAILING_WAGE_EXPLAINER.whyItMatters.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="explainer-section">
        <h2>{PREVAILING_WAGE_EXPLAINER.howDetermined.title}</h2>
        <div className="determination-steps">
          {PREVAILING_WAGE_EXPLAINER.howDetermined.steps.map((step) => (
            <div key={step.step} className="determination-step">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="explainer-section">
        <h2>{PREVAILING_WAGE_EXPLAINER.dolRole.title}</h2>
        <div className="explainer-content">
          {PREVAILING_WAGE_EXPLAINER.dolRole.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="explainer-section">
        <h2>{PREVAILING_WAGE_EXPLAINER.countyVariations.title}</h2>
        <div className="explainer-content">
          {PREVAILING_WAGE_EXPLAINER.countyVariations.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="explainer-section">
        <h2>{PREVAILING_WAGE_EXPLAINER.updateFrequency.title}</h2>
        <div className="explainer-content">
          {PREVAILING_WAGE_EXPLAINER.updateFrequency.content.split("\n\n").map((paragraph, idx) => {
            // Handle markdown links
            const parts = paragraph.split(/(\[.*?\]\(.*?\))/);
            return (
              <p key={idx}>
                {parts.map((part, partIdx) => {
                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                  if (linkMatch) {
                    return (
                      <a
                        key={partIdx}
                        href={linkMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {linkMatch[1]}
                      </a>
                    );
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      </section>
    </div>
  );
}

PrevailingWageExplainer.propTypes = {};
