import React from "react";
import PropTypes from "prop-types";
import { H1B_PROCESS_EDUCATION } from "../../data/educationContent";

/**
 * Educational content about the H1B visa process
 */
export default function H1BProcessEducation() {
  return (
    <div className="h1b-process-education">
      <section className="process-section">
        <h2>{H1B_PROCESS_EDUCATION.overview.title}</h2>
        <p>{H1B_PROCESS_EDUCATION.overview.content}</p>
      </section>

      <section className="process-section">
        <h2>Step-by-Step Process</h2>
        <div className="process-steps">
          {H1B_PROCESS_EDUCATION.steps.map((step) => (
            <div key={step.step} className="process-step">
              <div className="step-header">
                <div className="step-number-large">{step.step}</div>
                <div className="step-title-duration">
                  <h3>{step.title}</h3>
                  <span className="step-duration">{step.duration}</span>
                </div>
              </div>
              <p className="step-description">{step.description}</p>
              <div className="step-requirements">
                <h4>Requirements:</h4>
                <ul>
                  {step.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="process-section">
        <h2>{H1B_PROCESS_EDUCATION.prevailingWageRole.title}</h2>
        <div className="process-content">
          {H1B_PROCESS_EDUCATION.prevailingWageRole.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="process-section">
        <h2>{H1B_PROCESS_EDUCATION.timeline.title}</h2>
        <div className="process-content">
          {H1B_PROCESS_EDUCATION.timeline.content.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="process-section">
        <h2>{H1B_PROCESS_EDUCATION.commonChallenges.title}</h2>
        <div className="challenges-list">
          {H1B_PROCESS_EDUCATION.commonChallenges.challenges.map((item, idx) => (
            <div key={idx} className="challenge-item">
              <h4>{item.challenge}</h4>
              <p>{item.solution}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="process-section">
        <h2>{H1B_PROCESS_EDUCATION.resources.title}</h2>
        <div className="resources-list">
          {H1B_PROCESS_EDUCATION.resources.links.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              <h4>{resource.title}</h4>
              <p>{resource.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

H1BProcessEducation.propTypes = {};
