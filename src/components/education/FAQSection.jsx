import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useDebounce } from "../../hooks/useDebounce";
import { faqData, FAQ_CATEGORIES } from "../../data/faqData";

/**
 * Searchable FAQ component
 */
export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter((faq) => {
        const questionMatch = faq.question.toLowerCase().includes(query);
        const answerMatch = faq.answer.toLowerCase().includes(query);
        const tagMatch = faq.tags.some((tag) => tag.toLowerCase().includes(query));
        return questionMatch || answerMatch || tagMatch;
      });
    }

    return filtered;
  }, [debouncedSearch, selectedCategory]);

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, idx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={idx} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const categories = Object.values(FAQ_CATEGORIES);

  return (
    <div className="faq-section">
      <div className="faq-search-container">
        <div className="faq-search">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input"
            aria-label="Search frequently asked questions"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="faq-search-clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="faq-categories">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`faq-category-btn ${selectedCategory === null ? "active" : ""}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`faq-category-btn ${selectedCategory === category ? "active" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="faq-results" role="region" aria-live="polite">
        {filteredFAQs.length === 0 ? (
          <div className="faq-empty">
            <p className="faq-empty-message">No FAQs found matching your search.</p>
            {debouncedSearch.trim() && (
              <p className="faq-empty-suggestion">
                Try different keywords or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="faq-clear-all"
                >
                  clear all filters
                </button>
                .
              </p>
            )}
          </div>
        ) : (
          <div className="faq-list">
            {filteredFAQs.map((faq) => {
              const isExpanded = expandedItems.has(faq.id);
              return (
                <div key={faq.id} className="faq-item">
                  <button
                    type="button"
                    id={`faq-question-${faq.id}`}
                    className={`faq-question ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className="faq-question-text">
                      {highlightText(faq.question, debouncedSearch)}
                    </span>
                    <span className="faq-category-badge">{faq.category}</span>
                    <span className="faq-expand-icon" aria-hidden="true">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>
                  {isExpanded && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="faq-answer"
                      role="region"
                      aria-labelledby={`faq-question-${faq.id}`}
                    >
                      <div className="faq-answer-content">
                        {faq.answer.split("\n\n").map((paragraph, idx) => {
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
                                return highlightText(part, debouncedSearch);
                              })}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredFAQs.length > 0 && (
        <div className="faq-count">
          Showing {filteredFAQs.length} of {faqData.length} FAQs
        </div>
      )}
    </div>
  );
}

FAQSection.propTypes = {};
