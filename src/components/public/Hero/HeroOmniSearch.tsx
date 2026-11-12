"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLink from "@/components/common/AppLink";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { searchTools, MasterTool } from "@/config/tools-registry";
import {
  LuSearch,
  LuSparkles,
  LuImage,
  LuEraser,
  LuFileText,
  LuCode,
} from "react-icons/lu";

export default function HeroOmniSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MasterTool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update search results on input change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const matches = searchTools(query, 6);
    setResults(matches);
    setIsOpen(true);
    setSelectedIndex(0);
  }, [query]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Key navigation in dropdown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (results[selectedIndex]) {
        e.preventDefault();
        window.location.href = results[selectedIndex].href;
      }
    }
  };

  return (
    <div className="omni-search-wrapper">
      <div className="omni-search-input-box">
        <LuSearch className="omni-search-icon" size={19} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search 25+ tools (e.g. compress, background remover, pdf to word, serp)..."
          className="omni-search-input"
          aria-label="Search tools"
        />
        <div className="omni-search-shortcut">
          <span>Ctrl</span>
          <span>K</span>
        </div>
      </div>

      {/* Live Popover Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} className="omni-search-dropdown">
          {results.length > 0 ? (
            results.map((tool, idx) => (
              <AppLink
                key={tool.id}
                href={tool.href}
                className={`omni-dropdown-item ${idx === selectedIndex ? "active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                <div className="omni-item-left">
                  <div className="omni-item-icon">
                    <DynamicIcon name={tool.icon} size={18} fallback={<LuSparkles size={16} />} />
                  </div>
                  <div className="omni-item-info">
                    <span className="omni-item-title">{tool.title}</span>
                    <span className="omni-item-category">{tool.categoryLabel}</span>
                  </div>
                </div>
                {tool.badge && <span className="omni-item-badge">{tool.badge}</span>}
              </AppLink>
            ))
          ) : (
            <div className="omni-empty-state">
              No direct matches for &quot;{query}&quot;. Try &quot;image&quot;, &quot;pdf&quot;, or &quot;seo&quot;.
            </div>
          )}
        </div>
      )}

      {/* Quick Action Pills (Using Lucide Icons instead of emojis) */}
      <div className="omni-intent-pills">
        <AppLink href="/tools/image-tools/image-compressor" className="omni-pill">
          <LuImage size={14} className="omni-pill-icon" />
          <span>Compress Image</span>
        </AppLink>
        <AppLink href="/tools/image-tools/background-remover" className="omni-pill">
          <LuEraser size={14} className="omni-pill-icon" />
          <span>Erase Background</span>
        </AppLink>
        <AppLink href="/tools/pdf-tools/pdf-to-word-converter" className="omni-pill">
          <LuFileText size={14} className="omni-pill-icon" />
          <span>PDF to Word</span>
        </AppLink>
        <AppLink href="/tools/seo-tools/google-serp-snippet-simulator" className="omni-pill">
          <LuSearch size={14} className="omni-pill-icon" />
          <span>Google SERP Preview</span>
        </AppLink>
        <AppLink href="/tools/developer-tools/json-formatter" className="omni-pill">
          <LuCode size={14} className="omni-pill-icon" />
          <span>JSON Formatter</span>
        </AppLink>
      </div>
    </div>
  );
}
