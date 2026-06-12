import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

// Cap rendered options so typing stays responsive against the full SOC list
const MAX_RESULTS = 50;
const LISTBOX_ID = "soc-autocomplete-listbox";

export default function SocAutocomplete({ value, onSelect }) {
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState(value ? value : "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [loadError, setLoadError] = useState(false);

  // Load SOC options
  useEffect(() => {
    fetch("/data/soc_codes.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load SOC codes"))))
      .then(setOptions)
      .catch((err) => {
        console.error("Failed to load SOC codes:", err);
        setLoadError(true);
      });
  }, []);

  // Keep the input in sync when the selected value changes externally
  // (e.g. restored from a shared URL after mount)
  useEffect(() => {
    if (value) {
      setQuery(value);
    }
  }, [value]);

  // Click-outside handler
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const matches = [];
    for (const o of options) {
      if (`${o.code} ${o.title}`.toLowerCase().includes(q)) {
        matches.push(o);
        if (matches.length >= MAX_RESULTS) break;
      }
    }
    return matches;
  }, [options, query]);

  // Keep the highlighted option visible while navigating with arrow keys
  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const el = listRef.current.children[highlighted];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const selectOption = (o) => {
    const display = `${o.code} – ${o.title}`;
    onSelect(o.parent, display);
    setQuery(display);
    setOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((i) => (i + 1 >= filtered.length ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      setHighlighted((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (open && highlighted >= 0 && highlighted < filtered.length) {
        e.preventDefault();
        selectOption(filtered[highlighted]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: 400 }}>
      <input
        id="occupation-input"
        className="input-box"
        type="text"
        value={query}
        placeholder="Enter job title or SOC code"
        role="combobox"
        aria-expanded={open && filtered.length > 0}
        aria-controls={LISTBOX_ID}
        aria-autocomplete="list"
        aria-activedescendant={
          open && highlighted >= 0 ? `soc-option-${highlighted}` : undefined
        }
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
      />
      {open && loadError && (
        <div role="alert" style={{ fontSize: 13, color: "#dc2626", marginTop: 4 }}>
          Could not load occupation list. Please reload the page.
        </div>
      )}
      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Occupation suggestions"
          style={{
            position: "absolute",
            zIndex: 10,
            background: "#fff",
            border: "1px solid #ccc",
            maxHeight: 200,
            overflowY: "auto",
            width: "100%",
            fontSize: 14,
          }}
        >
          {filtered.map((o, i) => (
            <div
              key={o.code}
              id={`soc-option-${i}`}
              role="option"
              aria-selected={i === highlighted}
              onClick={() => selectOption(o)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: "6px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                background: i === highlighted ? "#EFF6FF" : "#fff",
              }}
            >
              <strong>{o.code}</strong> — {o.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SocAutocomplete.propTypes = {
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
