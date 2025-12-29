import React from "react";
import PropTypes from "prop-types";
import GitHubIcon from "./icons/GitHubIcon";
import ShareIcon from "./icons/ShareIcon";
import HelpIcon from "./icons/HelpIcon";

/**
 * Panel footer component with links and share button
 * @param {Function} onShare - Share button callback
 * @param {Function} onHelpClick - Help button callback
 */
export default function PanelFooter({ onShare, onHelpClick }) {
  return (
    <>
      <div className="footer">
        <div className="footer-left">
          <a
            href="https://github.com/ankitjawla"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source code on GitHub"
            title="GitHub"
            className="icon-link"
          >
            <GitHubIcon />
          </a>

          <button
            type="button"
            onClick={onShare}
            aria-label="Share this page"
            title="Share"
            className="icon-button"
          >
            <ShareIcon />
          </button>

          <button
            type="button"
            onClick={onHelpClick}
            aria-label="Open education and help"
            title="Help & Education"
            className="icon-button"
          >
            <HelpIcon />
          </button>
        </div>

        <a
          className="oflc-link"
          href="https://flag.dol.gov/wage-data/wage-search"
          target="_blank"
          rel="noopener noreferrer"
        >
          OFLC Wage Data ↗
        </a>
      </div>

      <div className="credit">
        Created by{" "}
        <a
          href="https://github.com/ankitjawla"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View ankit.jawla's GitHub profile"
        >
          <strong>@ankit.jawla</strong>
        </a>
      </div>
    </>
  );
}

PanelFooter.propTypes = {
  onShare: PropTypes.func.isRequired,
  onHelpClick: PropTypes.func.isRequired,
};


